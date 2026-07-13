
class TextType {
  /**
   * @param {HTMLElement} container  - The element that will contain the typed text
   * @param {Object}      options
   * @param {string|string[]} options.text           - Text(s) to type
   * @param {number}      [options.typingSpeed=50]   - ms per character typed
   * @param {number}      [options.deletingSpeed=30] - ms per character deleted
   * @param {number}      [options.pauseDuration=2000] - ms pause before deleting
   * @param {number}      [options.initialDelay=0]   - ms before first type starts
   * @param {boolean}     [options.loop=true]        - Loop through texts array
   * @param {boolean}     [options.showCursor=true]  - Show blinking cursor
   * @param {string}      [options.cursorCharacter='|'] - Cursor character
   * @param {number}      [options.cursorBlinkDuration=0.5] - GSAP cursor blink duration (s)
   * @param {string}      [options.cursorClassName=''] - Extra class on cursor span
   * @param {boolean}     [options.hideCursorWhileTyping=false]
   * @param {string[]}    [options.textColors=[]]    - Per-sentence colors
   * @param {{min:number,max:number}} [options.variableSpeed] - Random speed range
   * @param {boolean}     [options.reverseMode=false] - Type right-to-left
   * @param {Function}    [options.onSentenceComplete] - Callback(sentence, index)
   */
  constructor(container, options = {}) {
    this.container = container;

    // Resolve options with defaults
    const rawText = options.text ?? container.dataset.texts ?? '';
    this.textArray = Array.isArray(rawText) ? rawText : [rawText];
    this.typingSpeed = options.typingSpeed ?? 50;
    this.deletingSpeed = options.deletingSpeed ?? 30;
    this.pauseDuration = options.pauseDuration ?? 2000;
    this.initialDelay = options.initialDelay ?? 0;
    this.loop = options.loop ?? true;
    this.showCursor = options.showCursor ?? true;
    this.cursorCharacter = options.cursorCharacter ?? '|';
    this.cursorBlinkDuration = options.cursorBlinkDuration ?? 0.5;
    this.cursorClassName = options.cursorClassName ?? '';
    this.hideCursorWhileTyping = options.hideCursorWhileTyping ?? false;
    this.textColors = options.textColors ?? [];
    this.variableSpeed = options.variableSpeed ?? null;
    this.reverseMode = options.reverseMode ?? false;
    this.onSentenceComplete = options.onSentenceComplete ?? null;

    // State
    this.displayedText = '';
    this.currentCharIndex = 0;
    this.isDeleting = false;
    this.currentTextIndex = 0;
    this._timeout = null;
    this._gsapTween = null;
    this._destroyed = false;

    this._buildDOM();
    this._startCursorBlink();

    // Kick off typing after initial delay
    this._timeout = setTimeout(() => this._tick(), this.initialDelay);
  }

  // ─── Private helpers ──────────────────────────────────────────────────────

  _buildDOM() {
    this.container.classList.add('text-type');
    this.container.innerHTML = '';

    // Content span
    this._contentSpan = document.createElement('span');
    this._contentSpan.className = 'text-type__content';
    this.container.appendChild(this._contentSpan);

    // Cursor span
    if (this.showCursor) {
      this._cursorSpan = document.createElement('span');
      this._cursorSpan.className = `text-type__cursor${this.cursorClassName ? ' ' + this.cursorClassName : ''}`;
      this._cursorSpan.textContent = this.cursorCharacter;
      this.container.appendChild(this._cursorSpan);
    }
  }

  _startCursorBlink() {
    if (!this.showCursor || !this._cursorSpan) return;
    if (typeof gsap !== 'undefined') {
      gsap.set(this._cursorSpan, { opacity: 1 });
      this._gsapTween = gsap.to(this._cursorSpan, {
        opacity: 0,
        duration: this.cursorBlinkDuration,
        repeat: -1,
        yoyo: true,
        ease: 'power2.inOut'
      });
    }
  }

  _getRandomSpeed() {
    if (!this.variableSpeed) return this.typingSpeed;
    const { min, max } = this.variableSpeed;
    return Math.random() * (max - min) + min;
  }

  _updateCursorVisibility() {
    if (!this._cursorSpan) return;
    const isActive = this.currentCharIndex < this.textArray[this.currentTextIndex].length || this.isDeleting;
    if (this.hideCursorWhileTyping && isActive) {
      this._cursorSpan.classList.add('text-type__cursor--hidden');
    } else {
      this._cursorSpan.classList.remove('text-type__cursor--hidden');
    }
  }

  _updateContentColor() {
    if (!this._contentSpan) return;
    if (this.textColors.length > 0) {
      this._contentSpan.style.color = this.textColors[this.currentTextIndex % this.textColors.length];
    } else {
      this._contentSpan.style.color = 'inherit';
    }
  }

  _tick() {
    if (this._destroyed) return;

    const currentText = this.textArray[this.currentTextIndex];
    const processedText = this.reverseMode
      ? currentText.split('').reverse().join('')
      : currentText;

    this._updateCursorVisibility();
    this._updateContentColor();

    if (this.isDeleting) {
      if (this.displayedText === '') {
        // Finished deleting — move to next text
        this.isDeleting = false;
        if (this.currentTextIndex === this.textArray.length - 1 && !this.loop) return;

        this.currentTextIndex = (this.currentTextIndex + 1) % this.textArray.length;
        this.currentCharIndex = 0;
        this._timeout = setTimeout(() => this._tick(), this.pauseDuration);
      } else {
        // Delete one character
        this.displayedText = this.displayedText.slice(0, -1);
        this._contentSpan.textContent = this.displayedText;
        this._timeout = setTimeout(() => this._tick(), this.deletingSpeed);
      }
    } else {
      if (this.currentCharIndex < processedText.length) {
        // Type one character
        this.displayedText += processedText[this.currentCharIndex];
        this._contentSpan.textContent = this.displayedText;
        this.currentCharIndex++;
        const delay = this.variableSpeed ? this._getRandomSpeed() : this.typingSpeed;
        this._timeout = setTimeout(() => this._tick(), delay);
      } else {
        // Finished typing this sentence — fire callback immediately
        if (typeof this.onSentenceComplete === 'function') {
          this.onSentenceComplete(this.textArray[this.currentTextIndex], this.currentTextIndex);
        }
        // Stop here if loop:false and last sentence
        if (!this.loop && this.currentTextIndex === this.textArray.length - 1) return;
        this._timeout = setTimeout(() => {
          this.isDeleting = true;
          this._tick();
        }, this.pauseDuration);
      }
    }
  }

  // ─── Public API ───────────────────────────────────────────────────────────

  /**
   * Restart the animation with a new set of texts (useful for language switch).
   * @param {string|string[]} newTexts
   */
  restart(newTexts) {
    this.destroy(false); // stop timers but keep DOM structure

    this.textArray = Array.isArray(newTexts) ? newTexts : [newTexts];
    this.displayedText = '';
    this.currentCharIndex = 0;
    this.isDeleting = false;
    this.currentTextIndex = 0;
    this._destroyed = false;

    if (this._contentSpan) this._contentSpan.textContent = '';
    this._startCursorBlink();
    this._timeout = setTimeout(() => this._tick(), this.initialDelay);
  }

  /**
   * Stop all timers and GSAP tweens.
   * @param {boolean} [removeDOM=true] - Whether to clear the container's innerHTML
   */
  destroy(removeDOM = true) {
    this._destroyed = true;
    clearTimeout(this._timeout);
    if (this._gsapTween) {
      this._gsapTween.kill();
      this._gsapTween = null;
    }
    if (removeDOM) {
      this.container.innerHTML = '';
      this.container.classList.remove('text-type');
    }
  }
}
