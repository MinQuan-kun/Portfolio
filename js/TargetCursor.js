/**
 * TargetCursor – Vanilla JS port of React Bits TargetCursor
 * Creates a circular target cursor with brackets that locks onto interactive elements.
 */
class TargetCursor {
  constructor(options = {}) {
    this.targetSelector = options.targetSelector || 'a, button, .btn, .btn-icon, .contact-btn, .btn-cert-view, .filter-btn, #mascot';
    this.spinDuration = options.spinDuration !== undefined ? options.spinDuration : 2;
    this.hideDefaultCursor = options.hideDefaultCursor !== false;
    this.hoverDuration = options.hoverDuration !== undefined ? options.hoverDuration : 0.2;
    this.parallaxOn = options.parallaxOn !== false;
    this.cursorColor = options.cursorColor || '#ffffff';
    this.cursorColorOnTarget = options.cursorColorOnTarget;
    this.isEnabled = false;

    this.isMobile = (
      ('ontouchstart' in window || navigator.maxTouchPoints > 0) &&
      window.innerWidth <= 768
    ) || /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(
      (navigator.userAgent || navigator.vendor || window.opera).toLowerCase()
    );

    if (this.isMobile) return;

    this.constants = {
      borderWidth: 3,
      cornerSize: 12
    };

    // Binding methods
    this.moveHandler = this.moveHandler.bind(this);
    this.enterHandler = this.enterHandler.bind(this);
    this.scrollHandler = this.scrollHandler.bind(this);
    this.mouseDownHandler = this.mouseDownHandler.bind(this);
    this.mouseUpHandler = this.mouseUpHandler.bind(this);
    this.resizeHandler = this.resizeHandler.bind(this);
    this.tickerFn = this.tickerFn.bind(this);

    this.createDom();
    this.initTimeline();
  }

  createDom() {
    this.cursorEl = document.createElement('div');
    this.cursorEl.className = 'target-cursor-wrapper';
    
    this.dotEl = document.createElement('div');
    this.dotEl.className = 'target-cursor-dot';
    this.dotEl.style.backgroundColor = this.cursorColor;
    this.cursorEl.appendChild(this.dotEl);
    
    this.corners = [];
    const cornerClasses = ['corner-tl', 'corner-tr', 'corner-br', 'corner-bl'];
    cornerClasses.forEach(cls => {
      const cornerEl = document.createElement('div');
      cornerEl.className = `target-cursor-corner ${cls}`;
      cornerEl.style.borderColor = this.cursorColor;
      this.cursorEl.appendChild(cornerEl);
      this.corners.push(cornerEl);
    });
    
    document.body.appendChild(this.cursorEl);
    
    // Hide initially
    this.cursorEl.style.display = 'none';
  }

  initTimeline() {
    this.spinTl = gsap
      .timeline({ repeat: -1 })
      .to(this.cursorEl, { rotation: '+=360', duration: this.spinDuration, ease: 'none' });
    this.spinTl.pause();
  }

  cleanupTarget(target) {
    if (this.currentLeaveHandler) {
      target.removeEventListener('mouseleave', this.currentLeaveHandler);
    }
    this.currentLeaveHandler = null;
  }

  moveCursor(x, y) {
    if (!this.cursorEl) return;
    const { x: offsetX, y: offsetY } = getContainingBlockOffset(this.containingBlock);
    gsap.to(this.cursorEl, {
      x: x - offsetX,
      y: y - offsetY,
      duration: 0.1,
      ease: 'power3.out'
    });
  }

  moveHandler(e) {
    this.moveCursor(e.clientX, e.clientY);
  }

  resizeHandler() {
    this.containingBlock = getContainingBlock(this.cursorEl);
  }

  mouseDownHandler() {
    if (!this.dotEl) return;
    gsap.to(this.dotEl, { scale: 0.7, duration: 0.3 });
    gsap.to(this.cursorEl, { scale: 0.9, duration: 0.2 });
  }

  mouseUpHandler() {
    if (!this.dotEl) return;
    gsap.to(this.dotEl, { scale: 1, duration: 0.3 });
    gsap.to(this.cursorEl, { scale: 1, duration: 0.2 });
  }

  enterHandler(e) {
    const directTarget = e.target;
    const allTargets = [];
    let current = directTarget;
    while (current && current !== document.body) {
      if (current.matches && current.matches(this.targetSelector)) {
        allTargets.push(current);
      }
      current = current.parentElement;
    }
    const target = allTargets[0] || null;
    if (!target || !this.cursorEl || !this.corners) return;
    if (this.activeTarget === target) return;
    
    if (this.activeTarget) {
      this.cleanupTarget(this.activeTarget);
    }
    
    if (this.resumeTimeout) {
      clearTimeout(this.resumeTimeout);
      this.resumeTimeout = null;
    }

    if (this.lockHideTimeout) {
      clearTimeout(this.lockHideTimeout);
      this.lockHideTimeout = null;
    }
    
    // Make target cursor visible and hide the default browser pointer
    gsap.killTweensOf(this.cursorEl, 'opacity');
    gsap.to(this.cursorEl, { opacity: 1, duration: 0.15 });
    document.body.classList.add('hide-default-cursor');
    
    this.activeTarget = target;
    
    this.corners.forEach(corner => gsap.killTweensOf(corner, 'x,y'));
    gsap.killTweensOf(this.cursorEl, 'rotation');
    
    this.spinTl.pause();
    gsap.set(this.cursorEl, { rotation: 0 });
    
    if (this.cursorColorOnTarget) {
      gsap.to(this.corners, {
        borderColor: this.cursorColorOnTarget,
        duration: 0.15,
        ease: 'power2.out'
      });
      if (this.dotEl) {
        gsap.to(this.dotEl, {
          backgroundColor: this.cursorColorOnTarget,
          duration: 0.15,
          ease: 'power2.out'
        });
      }
    }
    
    const rect = target.getBoundingClientRect();
    const { borderWidth, cornerSize } = this.constants;
    const { x: offsetX, y: offsetY } = getContainingBlockOffset(this.containingBlock);
    const cursorX = gsap.getProperty(this.cursorEl, 'x');
    const cursorY = gsap.getProperty(this.cursorEl, 'y');
    
    this.targetCornerPositions = [
      { x: rect.left - borderWidth - offsetX, y: rect.top - borderWidth - offsetY },
      { x: rect.right + borderWidth - cornerSize - offsetX, y: rect.top - borderWidth - offsetY },
      { x: rect.right + borderWidth - cornerSize - offsetX, y: rect.bottom + borderWidth - cornerSize - offsetY },
      { x: rect.left - borderWidth - offsetX, y: rect.bottom + borderWidth - cornerSize - offsetY }
    ];
    
    this.isActive = true;
    this.activeStrength = { current: 0 };
    
    if (!this.tickerFnRef) {
      this.tickerFnRef = () => this.tickerFn();
    }
    gsap.ticker.add(this.tickerFnRef);
    
    gsap.to(this.activeStrength, {
      current: 1,
      duration: this.hoverDuration,
      ease: 'power2.out'
    });
    
    this.corners.forEach((corner, i) => {
      gsap.to(corner, {
        x: this.targetCornerPositions[i].x - cursorX,
        y: this.targetCornerPositions[i].y - cursorY,
        duration: 0.2,
        ease: 'power2.out'
      });
    });
    
    // Auto-hide targeting brackets after 1.2s of lock-on
    this.lockHideTimeout = setTimeout(() => {
      if (this.isActive) {
        gsap.to(this.cursorEl, { opacity: 0, duration: 0.4 });
      }
    }, 1200);
    
    const leaveHandler = () => {
      gsap.ticker.remove(this.tickerFnRef);
      this.isActive = false;
      this.targetCornerPositions = null;
      this.activeStrength.current = 0;
      this.activeTarget = null;
      
      if (this.lockHideTimeout) {
        clearTimeout(this.lockHideTimeout);
        this.lockHideTimeout = null;
      }
      
      // Hide custom cursor and restore standard browser pointer
      gsap.killTweensOf(this.cursorEl, 'opacity');
      gsap.to(this.cursorEl, { opacity: 0, duration: 0.2 });
      document.body.classList.remove('hide-default-cursor');
      
      if (this.cursorColorOnTarget && this.corners) {
        gsap.to(this.corners, {
          borderColor: this.cursorColor,
          duration: 0.15,
          ease: 'power2.out'
        });
        if (this.dotEl) {
          gsap.to(this.dotEl, {
            backgroundColor: this.cursorColor,
            duration: 0.15,
            ease: 'power2.out'
          });
        }
      }
      
      if (this.corners) {
        gsap.killTweensOf(this.corners, 'x,y');
        const { cornerSize } = this.constants;
        const positions = [
          { x: -cornerSize * 1.5, y: -cornerSize * 1.5 },
          { x: cornerSize * 0.5, y: -cornerSize * 1.5 },
          { x: cornerSize * 0.5, y: cornerSize * 0.5 },
          { x: -cornerSize * 1.5, y: cornerSize * 0.5 }
        ];
        const tl = gsap.timeline();
        this.corners.forEach((corner, index) => {
          tl.to(
            corner,
            {
              x: positions[index].x,
              y: positions[index].y,
              duration: 0.3,
              ease: 'power3.out'
            },
            0
          );
        });
      }
      
      this.resumeTimeout = setTimeout(() => {
        if (!this.activeTarget && this.cursorEl && this.spinTl) {
          const currentRotation = gsap.getProperty(this.cursorEl, 'rotation');
          const normalizedRotation = currentRotation % 360;
          this.spinTl.kill();
          this.spinTl = gsap
            .timeline({ repeat: -1 })
            .to(this.cursorEl, { rotation: '+=360', duration: this.spinDuration, ease: 'none' });
          gsap.to(this.cursorEl, {
            rotation: normalizedRotation + 360,
            duration: this.spinDuration * (1 - normalizedRotation / 360),
            ease: 'none',
            onComplete: () => {
              this.spinTl.restart();
            }
          });
        }
        this.resumeTimeout = null;
      }, 50);
      
      this.cleanupTarget(target);
    };
    
    this.currentLeaveHandler = leaveHandler;
    target.addEventListener('mouseleave', leaveHandler);
  }

  tickerFn() {
    if (!this.targetCornerPositions || !this.cursorEl || !this.corners) {
      return;
    }
    
    const strength = this.activeStrength.current;
    if (strength === 0) return;
    
    const cursorX = gsap.getProperty(this.cursorEl, 'x');
    const cursorY = gsap.getProperty(this.cursorEl, 'y');
    
    this.corners.forEach((corner, i) => {
      const currentX = gsap.getProperty(corner, 'x');
      const currentY = gsap.getProperty(corner, 'y');
      
      const targetX = this.targetCornerPositions[i].x - cursorX;
      const targetY = this.targetCornerPositions[i].y - cursorY;
      
      const finalX = currentX + (targetX - currentX) * strength;
      const finalY = currentY + (targetY - currentY) * strength;
      
      const duration = strength >= 0.99 ? (this.parallaxOn ? 0.2 : 0) : 0.05;
      
      gsap.to(corner, {
        x: finalX,
        y: finalY,
        duration: duration,
        ease: duration === 0 ? 'none' : 'power1.out',
        overwrite: 'auto'
      });
    });
  }

  scrollHandler() {
    if (!this.activeTarget || !this.cursorEl) return;
    const { x: offsetX, y: offsetY } = getContainingBlockOffset(this.containingBlock);
    const mouseX = gsap.getProperty(this.cursorEl, 'x') + offsetX;
    const mouseY = gsap.getProperty(this.cursorEl, 'y') + offsetY;
    const elementUnderMouse = document.elementFromPoint(mouseX, mouseY);
    const isStillOverTarget =
      elementUnderMouse &&
      (elementUnderMouse === this.activeTarget || elementUnderMouse.closest(this.targetSelector) === this.activeTarget);
    if (!isStillOverTarget) {
      if (this.currentLeaveHandler) {
        this.currentLeaveHandler();
      }
    }
  }

  enable() {
    if (this.isMobile || this.isEnabled) return;
    this.isEnabled = true;
    
    this.cursorEl.style.display = 'block';
    gsap.set(this.cursorEl, { opacity: 0 }); // starts invisible in empty space
    
    if (this.hideDefaultCursor) {
      // Inject temporary CSS style to force hide cursors only on elements having class hide-default-cursor
      const styleEl = document.createElement('style');
      styleEl.id = 'target-cursor-hide-default';
      styleEl.innerHTML = `
        .hide-default-cursor, .hide-default-cursor * {
          cursor: none !important;
        }
      `;
      document.head.appendChild(styleEl);
    }
    
    this.containingBlock = getContainingBlock(this.cursorEl);
    const initialOffset = getContainingBlockOffset(this.containingBlock);
    
    gsap.set(this.cursorEl, {
      xPercent: -50,
      yPercent: -50,
      x: window.innerWidth / 2 - initialOffset.x,
      y: window.innerHeight / 2 - initialOffset.y,
      rotation: 0
    });
    
    this.spinTl.play();
    
    window.addEventListener('mousemove', this.moveHandler);
    window.addEventListener('scroll', this.scrollHandler, { passive: true });
    window.addEventListener('mousedown', this.mouseDownHandler);
    window.addEventListener('mouseup', this.mouseUpHandler);
    window.addEventListener('mouseover', this.enterHandler, { passive: true });
    window.addEventListener('resize', this.resizeHandler);
  }

  disable() {
    if (this.isMobile || !this.isEnabled) return;
    this.isEnabled = false;
    
    this.cursorEl.style.display = 'none';
    
    const styleEl = document.getElementById('target-cursor-hide-default');
    if (styleEl) styleEl.remove();
    document.body.classList.remove('hide-default-cursor');
    
    window.removeEventListener('mousemove', this.moveHandler);
    window.removeEventListener('scroll', this.scrollHandler);
    window.removeEventListener('mousedown', this.mouseDownHandler);
    window.removeEventListener('mouseup', this.mouseUpHandler);
    window.removeEventListener('mouseover', this.enterHandler);
    window.removeEventListener('resize', this.resizeHandler);
    
    if (this.tickerFnRef) {
      gsap.ticker.remove(this.tickerFnRef);
    }
    
    if (this.activeTarget) {
      this.cleanupTarget(this.activeTarget);
    }

    if (this.lockHideTimeout) {
      clearTimeout(this.lockHideTimeout);
    }
    
    this.spinTl.pause();
    
    this.activeTarget = null;
    this.isActive = false;
    this.targetCornerPositions = null;
    this.activeStrength = 0;
  }
}

// Helpers
function getContainingBlock(element) {
  let node = element?.parentElement;
  while (node && node !== document.documentElement) {
    const style = getComputedStyle(node);
    if (
      style.transform !== 'none' ||
      style.perspective !== 'none' ||
      style.filter !== 'none' ||
      style.willChange.includes('transform') ||
      style.willChange.includes('perspective') ||
      style.willChange.includes('filter') ||
      /paint|layout|strict|content/.test(style.contain)
    ) {
      return node;
    }
    node = node.parentElement;
  }
  return null;
}

function getContainingBlockOffset(block) {
  if (!block) return { x: 0, y: 0 };
  const rect = block.getBoundingClientRect();
  return { x: rect.left + block.clientLeft, y: rect.top + block.clientTop };
}
