/**
 * TrueFocus – Vanilla JS port of React Bits TrueFocus
 * Camera-viewfinder focus bracket indicator for navigation links.
 */
class TrueFocus {
  constructor(container, options = {}) {
    this.container = container; // .nav-links list
    this.options = {
      manualMode: options.manualMode ?? true,
      blurAmount: options.blurAmount ?? 1.5, // 1.5px offers soft blur without breaking readability
      borderColor: options.borderColor ?? 'var(--accent-color)',
      glowColor: options.glowColor ?? 'rgba(0, 242, 255, 0.4)',
      animationDuration: options.animationDuration ?? 0.35,
      ...options
    };

    this.items = Array.from(this.container.querySelectorAll('a'));
    this.currentIndex = -1;
    this.frame = null;
    this._observers = [];
    this._resizeHandler = null;

    this.init();
  }

  init() {
    // 1. Create focus frame with camera corners
    this.frame = document.createElement('div');
    this.frame.className = 'focus-frame';
    this.frame.style.transition = `all ${this.options.animationDuration}s cubic-bezier(0.25, 0.8, 0.25, 1)`;
    this.frame.style.setProperty('--border-color', this.options.borderColor);
    this.frame.style.setProperty('--glow-color', this.options.glowColor);
    this.frame.style.opacity = '0';
    
    ['top-left', 'top-right', 'bottom-left', 'bottom-right'].forEach(cls => {
      const corner = document.createElement('span');
      corner.className = `corner ${cls}`;
      this.frame.appendChild(corner);
    });

    this.container.appendChild(this.frame);

    // 2. Set item transition and hover triggers
    this.items.forEach((item, index) => {
      item.classList.add('focus-word');
      item.style.transition = `filter ${this.options.animationDuration}s ease, opacity ${this.options.animationDuration}s ease, color 0.3s ease`;

      item.addEventListener('mouseenter', () => {
        this.setFocus(index);
      });
    });

    // 3. Container leave -> return to active section item
    this.container.addEventListener('mouseleave', () => {
      this.resetToActive();
    });

    // 4. Mutation Observer to sync with ScrollSpy active class updates
    this.items.forEach((item, index) => {
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.attributeName === 'class') {
            const isHovering = this.container.querySelector('a:hover');
            if (!isHovering && item.classList.contains('active')) {
              this.setFocus(index);
            }
          }
        });
      });
      observer.observe(item, { attributes: true });
      this._observers.push(observer);
    });

    // 5. Handle window resize to keep coordinates correct
    this._resizeHandler = () => {
      const isHovering = this.container.querySelector('a:hover');
      if (isHovering) {
        const hoverIdx = this.items.indexOf(isHovering);
        this.setFocus(hoverIdx);
      } else {
        this.resetToActive();
      }
    };
    window.addEventListener('resize', this._resizeHandler);

    // Initial position
    setTimeout(() => this.resetToActive(), 150);
  }

  setFocus(index) {
    if (index === null || index === -1) return;
    this.currentIndex = index;

    const item = this.items[index];
    const parentRect = this.container.getBoundingClientRect();
    const activeRect = item.getBoundingClientRect();

    // Position focus bracket
    this.frame.style.left = `${activeRect.left - parentRect.left}px`;
    this.frame.style.top = `${activeRect.top - parentRect.top}px`;
    this.frame.style.width = `${activeRect.width}px`;
    this.frame.style.height = `${activeRect.height}px`;
    this.frame.style.opacity = '1';

    // Blur other navigation links, focus current
    this.items.forEach((it, idx) => {
      if (idx === index) {
        it.style.filter = 'blur(0px)';
        it.style.opacity = '1';
      } else {
        it.style.filter = `blur(${this.options.blurAmount}px)`;
        it.style.opacity = '0.55';
      }
    });
  }

  clearFocus() {
    this.currentIndex = -1;
    this.frame.style.opacity = '0';
    this.items.forEach(it => {
      it.style.filter = 'blur(0px)';
      it.style.opacity = '1';
    });
  }

  resetToActive() {
    const activeIndex = this.items.findIndex(item => item.classList.contains('active'));
    if (activeIndex !== -1) {
      this.setFocus(activeIndex);
    } else {
      this.clearFocus();
    }
  }

  destroy() {
    this._observers.forEach(obs => obs.disconnect());
    if (this._resizeHandler) {
      window.removeEventListener('resize', this._resizeHandler);
    }
    this.frame?.remove();
  }
}
