class LogoLoop {
  constructor(container, logos, options = {}) {
    this.container   = container;
    this.logos       = logos;

    this.speed       = options.speed       ?? 80;         
    this.direction   = options.direction   ?? 'left';
    this.logoHeight  = options.logoHeight  ?? 36;          
    this.gap         = options.gap         ?? 48;          
    this.hoverSpeed  = options.hoverSpeed  ?? 0;           
    this.fadeOut     = options.fadeOut     ?? true;
    this.fadeOutColor= options.fadeOutColor ?? null;       
    this.scaleOnHover= options.scaleOnHover ?? false;
    this.ariaLabel   = options.ariaLabel   ?? 'Technology logos';
    this.className   = options.className   ?? '';

    // Animation config
    this._SMOOTH_TAU  = 0.25;
    this._MIN_COPIES  = 2;
    this._COPY_HEADROOM = 2;

    // State
    this._isHovered   = false;
    this._seqWidth    = 0;
    this._copyCount   = this._MIN_COPIES;
    this._offset      = 0;
    this._velocity    = 0;
    this._lastTs      = null;
    this._raf         = null;
    this._ro          = null;

    this._build();
    this._bindEvents();
    this._measure();
    this._startLoop();
  }


  _build() {
    this.container.innerHTML = '';

    // CSS variables
    const cssVars = [
      `--logoloop-gap: ${this.gap}px`,
      `--logoloop-logoHeight: ${this.logoHeight}px`,
      this.fadeOutColor ? `--logoloop-fadeColor: ${this.fadeOutColor}` : ''
    ].filter(Boolean).join('; ');

    const classes = [
      'logoloop',
      'logoloop--horizontal',
      this.fadeOut       ? 'logoloop--fade'        : '',
      this.scaleOnHover  ? 'logoloop--scale-hover' : '',
      this.className
    ].filter(Boolean).join(' ');

    this._root = document.createElement('div');
    this._root.className = classes;
    this._root.setAttribute('style', cssVars);
    this._root.setAttribute('role', 'region');
    this._root.setAttribute('aria-label', this.ariaLabel);

    this._track = document.createElement('div');
    this._track.className = 'logoloop__track';
    this._root.appendChild(this._track);

    this.container.appendChild(this._root);

    this._renderCopies();
  }

  _renderItem(logo, key) {
    const li = document.createElement('li');
    li.className = 'logoloop__item';
    li.setAttribute('role', 'listitem');

    let inner;
    if (logo.html) {
      inner = document.createElement('span');
      inner.className = 'logoloop__node';
      inner.innerHTML = logo.html;
      if (logo.title) inner.setAttribute('title', logo.title);
    } else if (logo.src) {
      inner = document.createElement('img');
      inner.src = logo.src;
      inner.alt = logo.alt ?? logo.title ?? '';
      if (logo.title) inner.title = logo.title;
      inner.loading = 'lazy';
      inner.decoding = 'async';
      inner.draggable = false;
    }

    if (logo.href && inner) {
      const a = document.createElement('a');
      a.className = 'logoloop__link';
      a.href = logo.href;
      a.target = '_blank';
      a.rel = 'noreferrer noopener';
      a.setAttribute('aria-label', logo.title ?? logo.alt ?? 'logo link');
      a.appendChild(inner);
      li.appendChild(a);
    } else if (inner) {
      li.appendChild(inner);
    }

    return li;
  }

  _renderCopies() {
    this._track.innerHTML = '';
    this._lists = [];

    for (let c = 0; c < this._copyCount; c++) {
      const ul = document.createElement('ul');
      ul.className = 'logoloop__list';
      ul.setAttribute('role', 'list');
      if (c > 0) ul.setAttribute('aria-hidden', 'true');

      this.logos.forEach((logo, i) => {
        ul.appendChild(this._renderItem(logo, `${c}-${i}`));
      });

      this._track.appendChild(ul);
      this._lists.push(ul);
    }
  }


  _measure() {
    if (!this._lists[0]) return;
    const rect = this._lists[0].getBoundingClientRect();
    const w = Math.ceil(rect.width);
    if (w === 0) return;

    this._seqWidth = w;
    const containerW = this._root.clientWidth;
    const needed = Math.ceil(containerW / w) + this._COPY_HEADROOM;
    const newCount = Math.max(this._MIN_COPIES, needed);

    if (newCount !== this._copyCount) {
      this._copyCount = newCount;
      this._renderCopies();
    }
  }


  _targetVelocity() {
    const sign = this.direction === 'left' ? 1 : -1;
    const magnitude = Math.abs(this.speed);
    return magnitude * sign;
  }

  _startLoop() {
    const animate = (ts) => {
      if (this._lastTs === null) this._lastTs = ts;
      const dt = Math.max(0, ts - this._lastTs) / 1000;
      this._lastTs = ts;

      const target = this._isHovered ? this.hoverSpeed : this._targetVelocity();
      const ease   = 1 - Math.exp(-dt / this._SMOOTH_TAU);
      this._velocity += (target - this._velocity) * ease;

      if (this._seqWidth > 0) {
        let next = this._offset + this._velocity * dt;
        next = ((next % this._seqWidth) + this._seqWidth) % this._seqWidth;
        this._offset = next;
        this._track.style.transform = `translate3d(${-this._offset}px, 0, 0)`;
      }

      this._raf = requestAnimationFrame(animate);
    };

    this._raf = requestAnimationFrame(animate);
  }


  _bindEvents() {
    this._track.addEventListener('mouseenter', () => { this._isHovered = true;  });
    this._track.addEventListener('mouseleave', () => { this._isHovered = false; });

    if (window.ResizeObserver) {
      this._ro = new ResizeObserver(() => this._measure());
      this._ro.observe(this._root);
      this._ro.observe(this._lists[0]);
    } else {
      window.addEventListener('resize', () => this._measure());
    }

    // Re-measure after images load
    this._root.querySelectorAll('img').forEach(img => {
      if (!img.complete) img.addEventListener('load', () => this._measure(), { once: true });
    });
  }


  destroy() {
    if (this._raf) cancelAnimationFrame(this._raf);
    if (this._ro)  this._ro.disconnect();
    this.container.innerHTML = '';
  }
}
