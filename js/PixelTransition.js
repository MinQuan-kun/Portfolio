class PixelTransition {
  /**
   * @param {HTMLElement} container         
   * @param {Object}      options
   * @param {string|HTMLElement} options.firstContent   
   * @param {string|HTMLElement} options.secondContent  
   * @param {number}      [options.gridSize=7]
   * @param {string}      [options.pixelColor='currentColor']
   * @param {number}      [options.animationStepDuration=0.3]
   * @param {boolean}     [options.once=false]          
   * @param {string}      [options.aspectRatio='100%']  
   * @param {string}      [options.className='']
   * @param {Object}      [options.style={}]
   */
  constructor(container, options = {}) {
    this.container = container;

    this.gridSize             = options.gridSize             ?? 7;
    this.pixelColor           = options.pixelColor           ?? 'currentColor';
    this.animationStepDuration = options.animationStepDuration ?? 0.3;
    this.once                 = options.once                 ?? false;
    this.aspectRatio          = options.aspectRatio          ?? '100%';
    this.className            = options.className            ?? '';
    this.style                = options.style                ?? {};

    this._firstContent  = options.firstContent  ?? '';
    this._secondContent = options.secondContent ?? '';

    this._isActive        = false;
    this._delayedCall     = null;
    this._isTouchDevice   = this._detectTouch();

    this._buildDOM();
    this._buildPixelGrid();
    this._bindEvents();
  }


  _detectTouch() {
    return (
      'ontouchstart' in window ||
      navigator.maxTouchPoints > 0 ||
      window.matchMedia('(pointer: coarse)').matches
    );
  }

  _buildDOM() {
    this._card = document.createElement('div');
    this._card.className = `pixelated-image-card${this.className ? ' ' + this.className : ''}`;
    Object.assign(this._card.style, this.style);
    this._card.setAttribute('tabindex', '0');

    this._defaultLayer = document.createElement('div');
    this._defaultLayer.className = 'pixelated-image-card__default';
    this._setContent(this._defaultLayer, this._firstContent);
    this._card.appendChild(this._defaultLayer);

    this._activeLayer = document.createElement('div');
    this._activeLayer.className = 'pixelated-image-card__active';
    this._setContent(this._activeLayer, this._secondContent);
    this._card.appendChild(this._activeLayer);

    this._pixelGridEl = document.createElement('div');
    this._pixelGridEl.className = 'pixelated-image-card__pixels';
    this._card.appendChild(this._pixelGridEl);

    this.container.innerHTML = '';
    this.container.appendChild(this._card);
  }

  _setContent(layer, content) {
    if (typeof content === 'string') {
      layer.innerHTML = content;
    } else if (content instanceof HTMLElement) {
      layer.appendChild(content);
    }
  }

  _buildPixelGrid() {
    this._pixelGridEl.innerHTML = '';
    const size = 100 / this.gridSize;

    for (let row = 0; row < this.gridSize; row++) {
      for (let col = 0; col < this.gridSize; col++) {
        const pixel = document.createElement('div');
        pixel.className = 'pixelated-image-card__pixel';
        pixel.style.backgroundColor = this.pixelColor;
        pixel.style.width  = `${size}%`;
        pixel.style.height = `${size}%`;
        pixel.style.left   = `${col * size}%`;
        pixel.style.top    = `${row * size}%`;
        this._pixelGridEl.appendChild(pixel);
      }
    }
  }

  _bindEvents() {
    if (this._isTouchDevice) {
      this._card.addEventListener('click', () => this._handleClick());
    } else {
      this._card.addEventListener('mouseenter', () => this._handleEnter());
      this._card.addEventListener('mouseleave', () => this._handleLeave());
      this._card.addEventListener('focus',      () => this._handleEnter());
      this._card.addEventListener('blur',       () => this._handleLeave());
    }
  }


  _animatePixels(activate) {
    this._isActive = activate;

    const pixels = this._pixelGridEl.querySelectorAll('.pixelated-image-card__pixel');
    if (!pixels.length) return;

    if (typeof gsap === 'undefined') return;

    gsap.killTweensOf(pixels);
    if (this._delayedCall) this._delayedCall.kill();

    gsap.set(pixels, { display: 'none' });

    const stagger = this.animationStepDuration / pixels.length;

    gsap.to(pixels, {
      display: 'block',
      duration: 0,
      stagger: { each: stagger, from: 'random' }
    });

    this._delayedCall = gsap.delayedCall(this.animationStepDuration, () => {
      this._activeLayer.style.display       = activate ? 'block' : 'none';
      this._activeLayer.style.pointerEvents = activate ? 'auto'  : 'none';
    });

    gsap.to(pixels, {
      display: 'none',
      duration: 0,
      delay: this.animationStepDuration,
      stagger: { each: stagger, from: 'random' }
    });
  }


  _handleEnter() {
    if (!this._isActive) this._animatePixels(true);
  }

  _handleLeave() {
    if (this._isActive && !this.once) this._animatePixels(false);
  }

  _handleClick() {
    if (!this._isActive)            this._animatePixels(true);
    else if (!this.once)            this._animatePixels(false);
  }

  destroy() {
    if (this._delayedCall) this._delayedCall.kill();
    this.container.innerHTML = '';
  }
}
