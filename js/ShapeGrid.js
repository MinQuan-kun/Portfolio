/**
 * ShapeGrid – Vanilla JS port of React Bits ShapeGrid
 * Renders an animated shape grid on a canvas with mouse hover paths.
 */
class ShapeGrid {
  constructor(canvas, options = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    
    this.options = {
      direction: options.direction ?? 'diagonal', // up, down, left, right, diagonal
      speed: options.speed ?? 0.5,
      borderColor: options.borderColor ?? '#e2e8f0',
      squareSize: options.squareSize ?? 40,
      hoverFillColor: options.hoverFillColor ?? 'rgba(79, 70, 229, 0.07)', // soft indigo tint
      shape: options.shape ?? 'square', // square, hexagon, circle, triangle
      hoverTrailAmount: options.hoverTrailAmount ?? 5,
      ...options
    };

    this.numSquaresX = 0;
    this.numSquaresY = 0;
    this.gridOffset = { x: 0, y: 0 };
    this.hoveredSquare = null;
    this.trailCells = [];
    this.cellOpacities = new Map();
    this.animationId = null;

    this.resizeCanvas = this.resizeCanvas.bind(this);
    this.handleMouseMove = this.handleMouseMove.bind(this);
    this.handleMouseLeave = this.handleMouseLeave.bind(this);
    this.updateAnimation = this.updateAnimation.bind(this);

    this.init();
  }

  init() {
    this.resizeCanvas();
    window.addEventListener('resize', this.resizeCanvas);
    window.addEventListener('mousemove', this.handleMouseMove);
    window.addEventListener('mouseleave', this.handleMouseLeave);

    this.start();
  }

  resizeCanvas() {
    // Get actual viewport client width/height
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    
    this.numSquaresX = Math.ceil(this.canvas.width / this.options.squareSize) + 1;
    this.numSquaresY = Math.ceil(this.canvas.height / this.options.squareSize) + 1;
  }

  drawHex(cx, cy, size) {
    this.ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i;
      const vx = cx + size * Math.cos(angle);
      const vy = cy + size * Math.sin(angle);
      if (i === 0) this.ctx.moveTo(vx, vy);
      else this.ctx.lineTo(vx, vy);
    }
    this.ctx.closePath();
  }

  drawCircle(cx, cy, size) {
    this.ctx.beginPath();
    this.ctx.arc(cx, cy, size / 2, 0, Math.PI * 2);
    this.ctx.closePath();
  }

  drawTriangle(cx, cy, size, flip) {
    this.ctx.beginPath();
    if (flip) {
      this.ctx.moveTo(cx, cy + size / 2);
      this.ctx.lineTo(cx + size / 2, cy - size / 2);
      this.ctx.lineTo(cx - size / 2, cy - size / 2);
    } else {
      this.ctx.moveTo(cx, cy - size / 2);
      this.ctx.lineTo(cx + size / 2, cy + size / 2);
      this.ctx.lineTo(cx - size / 2, cy + size / 2);
    }
    this.ctx.closePath();
  }

  drawGrid() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    const isHex = this.options.shape === 'hexagon';
    const isTri = this.options.shape === 'triangle';
    const isCircle = this.options.shape === 'circle';
    const hexHoriz = this.options.squareSize * 1.5;
    const hexVert = this.options.squareSize * Math.sqrt(3);

    if (isHex) {
      const colShift = Math.floor(this.gridOffset.x / hexHoriz);
      const offsetX = ((this.gridOffset.x % hexHoriz) + hexHoriz) % hexHoriz;
      const offsetY = ((this.gridOffset.y % hexVert) + hexVert) % hexVert;

      const cols = Math.ceil(this.canvas.width / hexHoriz) + 3;
      const rows = Math.ceil(this.canvas.height / hexVert) + 3;

      for (let col = -2; col < cols; col++) {
        for (let row = -2; row < rows; row++) {
          const cx = col * hexHoriz + offsetX;
          const cy = row * hexVert + ((col + colShift) % 2 !== 0 ? hexVert / 2 : 0) + offsetY;

          const cellKey = `${col},${row}`;
          const alpha = this.cellOpacities.get(cellKey);
          if (alpha) {
            this.ctx.globalAlpha = alpha;
            this.drawHex(cx, cy, this.options.squareSize);
            this.ctx.fillStyle = this.options.hoverFillColor;
            this.ctx.fill();
            this.ctx.globalAlpha = 1;
          }

          this.drawHex(cx, cy, this.options.squareSize);
          this.ctx.strokeStyle = this.options.borderColor;
          this.ctx.stroke();
        }
      }
    } else if (isTri) {
      const halfW = this.options.squareSize / 2;
      const colShift = Math.floor(this.gridOffset.x / halfW);
      const rowShift = Math.floor(this.gridOffset.y / this.options.squareSize);
      const offsetX = ((this.gridOffset.x % halfW) + halfW) % halfW;
      const offsetY = ((this.gridOffset.y % this.options.squareSize) + this.options.squareSize) % this.options.squareSize;

      const cols = Math.ceil(this.canvas.width / halfW) + 4;
      const rows = Math.ceil(this.canvas.height / this.options.squareSize) + 4;

      for (let col = -2; col < cols; col++) {
        for (let row = -2; row < rows; row++) {
          const cx = col * halfW + offsetX;
          const cy = row * this.options.squareSize + this.options.squareSize / 2 + offsetY;
          const flip = ((col + colShift + row + rowShift) % 2 + 2) % 2 !== 0;

          const cellKey = `${col},${row}`;
          const alpha = this.cellOpacities.get(cellKey);
          if (alpha) {
            this.ctx.globalAlpha = alpha;
            this.drawTriangle(cx, cy, this.options.squareSize, flip);
            this.ctx.fillStyle = this.options.hoverFillColor;
            this.ctx.fill();
            this.ctx.globalAlpha = 1;
          }

          this.drawTriangle(cx, cy, this.options.squareSize, flip);
          this.ctx.strokeStyle = this.options.borderColor;
          this.ctx.stroke();
        }
      }
    } else if (isCircle) {
      const offsetX = ((this.gridOffset.x % this.options.squareSize) + this.options.squareSize) % this.options.squareSize;
      const offsetY = ((this.gridOffset.y % this.options.squareSize) + this.options.squareSize) % this.options.squareSize;

      const cols = Math.ceil(this.canvas.width / this.options.squareSize) + 3;
      const rows = Math.ceil(this.canvas.height / this.options.squareSize) + 3;

      for (let col = -2; col < cols; col++) {
        for (let row = -2; row < rows; row++) {
          const cx = col * this.options.squareSize + this.options.squareSize / 2 + offsetX;
          const cy = row * this.options.squareSize + this.options.squareSize / 2 + offsetY;

          const cellKey = `${col},${row}`;
          const alpha = this.cellOpacities.get(cellKey);
          if (alpha) {
            this.ctx.globalAlpha = alpha;
            this.drawCircle(cx, cy, this.options.squareSize);
            this.ctx.fillStyle = this.options.hoverFillColor;
            this.ctx.fill();
            this.ctx.globalAlpha = 1;
          }

          this.drawCircle(cx, cy, this.options.squareSize);
          this.ctx.strokeStyle = this.options.borderColor;
          this.ctx.stroke();
        }
      }
    } else {
      const offsetX = ((this.gridOffset.x % this.options.squareSize) + this.options.squareSize) % this.options.squareSize;
      const offsetY = ((this.gridOffset.y % this.options.squareSize) + this.options.squareSize) % this.options.squareSize;

      const cols = Math.ceil(this.canvas.width / this.options.squareSize) + 3;
      const rows = Math.ceil(this.canvas.height / this.options.squareSize) + 3;

      for (let col = -2; col < cols; col++) {
        for (let row = -2; row < rows; row++) {
          const sx = col * this.options.squareSize + offsetX;
          const sy = row * this.options.squareSize + offsetY;

          const cellKey = `${col},${row}`;
          const alpha = this.cellOpacities.get(cellKey);
          if (alpha) {
            this.ctx.globalAlpha = alpha;
            this.ctx.fillStyle = this.options.hoverFillColor;
            this.ctx.fillRect(sx, sy, this.options.squareSize, this.options.squareSize);
            this.ctx.globalAlpha = 1;
          }

          this.ctx.strokeStyle = this.options.borderColor;
          this.ctx.strokeRect(sx, sy, this.options.squareSize, this.options.squareSize);
        }
      }
    }

    // Gradient overlay to fade edges slightly
    const gradient = this.ctx.createRadialGradient(
      this.canvas.width / 2,
      this.canvas.height / 2,
      0,
      this.canvas.width / 2,
      this.canvas.height / 2,
      Math.sqrt(this.canvas.width ** 2 + this.canvas.height ** 2) / 2
    );
    gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
    gradient.addColorStop(0.8, 'rgba(248, 250, 252, 0.45)'); // Blend beautifully with slate-50 light background
    gradient.addColorStop(1, 'rgba(248, 250, 252, 0.95)');

    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  updateAnimation() {
    const wrapX = this.options.shape === 'hexagon' ? this.options.squareSize * 3 : this.options.squareSize;
    const wrapY = this.options.shape === 'hexagon' ? this.options.squareSize * Math.sqrt(3) : this.options.shape === 'triangle' ? this.options.squareSize * 2 : this.options.squareSize;

    switch (this.options.direction) {
      case 'right':
        this.gridOffset.x = (this.gridOffset.x - this.options.speed + wrapX) % wrapX;
        break;
      case 'left':
        this.gridOffset.x = (this.gridOffset.x + this.options.speed + wrapX) % wrapX;
        break;
      case 'up':
        this.gridOffset.y = (this.gridOffset.y + this.options.speed + wrapY) % wrapY;
        break;
      case 'down':
        this.gridOffset.y = (this.gridOffset.y - this.options.speed + wrapY) % wrapY;
        break;
      case 'diagonal':
        this.gridOffset.x = (this.gridOffset.x - this.options.speed + wrapX) % wrapX;
        this.gridOffset.y = (this.gridOffset.y - this.options.speed + wrapY) % wrapY;
        break;
    }

    this.updateCellOpacities();
    this.drawGrid();
    this.animationId = requestAnimationFrame(this.updateAnimation);
  }

  updateCellOpacities() {
    const targets = new Map();

    if (this.hoveredSquare) {
      targets.set(`${this.hoveredSquare.x},${this.hoveredSquare.y}`, 1);
    }

    if (this.options.hoverTrailAmount > 0) {
      for (let i = 0; i < this.trailCells.length; i++) {
        const t = this.trailCells[i];
        const key = `${t.x},${t.y}`;
        if (!targets.has(key)) {
          targets.set(key, (this.options.hoverTrailAmount - i) / (this.options.hoverTrailAmount + 1));
        }
      }
    }

    for (const [key] of targets) {
      if (!this.cellOpacities.has(key)) {
        this.cellOpacities.set(key, 0);
      }
    }

    for (const [key, opacity] of this.cellOpacities) {
      const target = targets.get(key) || 0;
      const next = opacity + (target - opacity) * 0.15;
      if (next < 0.005) {
        this.cellOpacities.delete(key);
      } else {
        this.cellOpacities.set(key, next);
      }
    }
  }

  handleMouseMove(event) {
    const rect = this.canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    let col = 0;
    let row = 0;

    if (this.options.shape === 'hexagon') {
      const hexHoriz = this.options.squareSize * 1.5;
      const hexVert = this.options.squareSize * Math.sqrt(3);
      const colShift = Math.floor(this.gridOffset.x / hexHoriz);
      const offsetX = ((this.gridOffset.x % hexHoriz) + hexHoriz) % hexHoriz;
      const offsetY = ((this.gridOffset.y % hexVert) + hexVert) % hexVert;
      const adjustedX = mouseX - offsetX;
      const adjustedY = mouseY - offsetY;

      col = Math.round(adjustedX / hexHoriz);
      const rowOffset = (col + colShift) % 2 !== 0 ? hexVert / 2 : 0;
      row = Math.round((adjustedY - rowOffset) / hexVert);
    } else if (this.options.shape === 'triangle') {
      const halfW = this.options.squareSize / 2;
      const offsetX = ((this.gridOffset.x % halfW) + halfW) % halfW;
      const offsetY = ((this.gridOffset.y % this.options.squareSize) + this.options.squareSize) % this.options.squareSize;
      const adjustedX = mouseX - offsetX;
      const adjustedY = mouseY - offsetY;

      col = Math.round(adjustedX / halfW);
      row = Math.floor(adjustedY / this.options.squareSize);
    } else {
      const offsetX = ((this.gridOffset.x % this.options.squareSize) + this.options.squareSize) % this.options.squareSize;
      const offsetY = ((this.gridOffset.y % this.options.squareSize) + this.options.squareSize) % this.options.squareSize;
      const adjustedX = mouseX - offsetX;
      const adjustedY = mouseY - offsetY;

      col = Math.floor(adjustedX / this.options.squareSize);
      row = Math.floor(adjustedY / this.options.squareSize);
    }

    if (!this.hoveredSquare || this.hoveredSquare.x !== col || this.hoveredSquare.y !== row) {
      if (this.hoveredSquare && this.options.hoverTrailAmount > 0) {
        this.trailCells.unshift({ ...this.hoveredSquare });
        if (this.trailCells.length > this.options.hoverTrailAmount) {
          this.trailCells.length = this.options.hoverTrailAmount;
        }
      }
      this.hoveredSquare = { x: col, y: row };
    }
  }

  handleMouseLeave() {
    if (this.hoveredSquare && this.options.hoverTrailAmount > 0) {
      this.trailCells.unshift({ ...this.hoveredSquare });
      if (this.trailCells.length > this.options.hoverTrailAmount) {
        this.trailCells.length = this.options.hoverTrailAmount;
      }
    }
    this.hoveredSquare = null;
  }

  start() {
    if (!this.animationId) {
      this.updateAnimation();
    }
  }

  stop() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  destroy() {
    this.stop();
    window.removeEventListener('resize', this.resizeCanvas);
    window.removeEventListener('mousemove', this.handleMouseMove);
    window.removeEventListener('mouseleave', this.handleMouseLeave);
  }
}
