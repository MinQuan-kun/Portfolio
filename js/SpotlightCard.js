/**
 * SpotlightCard – Vanilla JS port of React Bits SpotlightCard
 * Tracks mouse position over elements to update background radial gradients.
 */
class SpotlightCard {
  constructor(element, options = {}) {
    this.element = element;
    this.options = {
      spotlightColor: options.spotlightColor ?? 'rgba(0, 229, 255, 0.15)',
      ...options
    };

    this.handleMouseMove = this.handleMouseMove.bind(this);
    this.init();
  }

  init() {
    this.element.classList.add('card-spotlight');
    this.element.addEventListener('mousemove', this.handleMouseMove);
  }

  handleMouseMove(e) {
    // Only track spotlight coordinates if NOT in gaming/pixel mode
    if (document.body.classList.contains('pixel-style')) return;

    const rect = this.element.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    this.element.style.setProperty('--mouse-x', `${x}px`);
    this.element.style.setProperty('--mouse-y', `${y}px`);
  }

  destroy() {
    this.element.removeEventListener('mousemove', this.handleMouseMove);
    this.element.classList.remove('card-spotlight');
  }
}
