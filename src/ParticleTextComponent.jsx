import React, { useRef, useEffect } from 'react';

// 粒子文字效果核心类
class ParticleText {
  constructor(canvas, config) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.config = { ...config };
    this.particles = [];
    this.animationId = null;
    this.textData = null;
    this.mouse = { x: null, y: null };
    this.resizeCanvas = this.resizeCanvas.bind(this);
    this.handleMouseMove = this.handleMouseMove.bind(this);
    this.handleMouseOut = this.handleMouseOut.bind(this);
    window.addEventListener('resize', this.resizeCanvas);
    this.canvas.addEventListener('mousemove', this.handleMouseMove);
    this.canvas.addEventListener('mouseout', this.handleMouseOut);
    this.init();
  }

  resizeCanvas() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.drawText();
  }

  init() {
    this.resizeCanvas();
    this.drawText();
    this.createTextData();
    this.createParticles();
    this.animate();
  }

  drawText() {
    const { backgroundColor, fontSize, text } = this.config;
    this.ctx.fillStyle = backgroundColor;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = `bold ${fontSize}px Arial`;
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText(text, this.canvas.width / 2, this.canvas.height / 2);
  }

  createTextData() {
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    tempCanvas.width = this.canvas.width;
    tempCanvas.height = this.canvas.height;
    const { fontSize, text } = this.config;
    tempCtx.fillStyle = '#ffffff';
    tempCtx.font = `bold ${fontSize}px Arial`;
    tempCtx.textAlign = 'center';
    tempCtx.textBaseline = 'middle';
    tempCtx.fillText(text, tempCanvas.width / 2, tempCanvas.height / 2);
    this.textData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
  }

  createParticles() {
    this.particles = [];
    const { particleDensity, particleSize, particleColors, particleShape, effectType } = this.config;
    const { width, height } = this.canvas;
    const centerX = width / 2;
    const centerY = height / 2;

    for (let y = 0; y < height; y += particleDensity) {
      for (let x = 0; x < width; x += particleDensity) {
        const idx = (y * width + x) * 4;
        if (this.textData.data[idx + 3] > 128) {
          const shape = particleShape;
          const color = particleColors[Math.floor(Math.random() * particleColors.length)];
          const p = {
            x: centerX,
            y: centerY,
            originalX: x,
            originalY: y,
            size: Math.random() * particleSize + 1,
            color,
            shape,
            vx: 0,
            vy: 0,
            friction: 0.9 + Math.random() * 0.1,
            ease: 0.01 + Math.random() * 0.1
          };
          // 初始效果
          if (effectType === 'explode') {
            p.vx = (Math.random() - 0.5) * 20;
            p.vy = (Math.random() - 0.5) * 20;
          } else if (effectType === 'flow') {
            p.x = Math.random() * width;
            p.y = Math.random() * height;
            p.vx = (Math.random() - 0.5) * 2;
            p.vy = (Math.random() - 0.5) * 2;
          } else if (effectType === 'random') {
            p.x = Math.random() * width;
            p.y = Math.random() * height;
          }
          this.particles.push(p);
        }
      }
    }
  }

  handleMouseMove(e) {
    const rect = this.canvas.getBoundingClientRect();
    this.mouse.x = e.clientX - rect.left;
    this.mouse.y = e.clientY - rect.top;
  }

  handleMouseOut() {
    this.mouse.x = null;
    this.mouse.y = null;
  }

  updateParticles() {
    const { animationSpeed } = this.config;
    const factor = animationSpeed / 10;
    this.particles.forEach(p => {
      if (this.mouse.x !== null) {
        const dx = p.x - this.mouse.x;
        const dy = p.y - this.mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 100) {
          const angle = Math.atan2(dy, dx);
          const repel = (100 - dist) / 100;
          p.vx += Math.cos(angle) * repel * 5;
          p.vy += Math.sin(angle) * repel * 5;
        }
      }
      const dx = p.originalX - p.x;
      const dy = p.originalY - p.y;
      p.vx += dx * p.ease * factor;
      p.vy += dy * p.ease * factor;
      p.vx *= p.friction;
      p.vy *= p.friction;
      p.x += p.vx;
      p.y += p.vy;
    });
  }

  drawParticles() {
    const { backgroundColor } = this.config;
    this.ctx.fillStyle = backgroundColor;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.particles.forEach(p => {
      this.ctx.fillStyle = p.color;
      this.ctx.beginPath();
      switch (p.shape) {
        case 'square':
          this.ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
          break;
        case 'triangle':
          this.ctx.moveTo(p.x, p.y - p.size);
          this.ctx.lineTo(p.x - p.size, p.y + p.size);
          this.ctx.lineTo(p.x + p.size, p.y + p.size);
          this.ctx.closePath();
          this.ctx.fill();
          break;
        default:
          this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          this.ctx.fill();
      }
    });
  }

  animate() {
    this.updateParticles();
    this.drawParticles();
    this.animationId = requestAnimationFrame(() => this.animate());
  }

  destroy() {
    cancelAnimationFrame(this.animationId);
    window.removeEventListener('resize', this.resizeCanvas);
    this.canvas.removeEventListener('mousemove', this.handleMouseMove);
    this.canvas.removeEventListener('mouseout', this.handleMouseOut);
  }

  updateConfig(config) {
    this.config = { ...this.config, ...config };
    cancelAnimationFrame(this.animationId);
    this.init();
  }
}

/**
 * 函数式组件：通过 props 传入配置项，并支持鼠标交互和多形状、多颜色
 */
export default function ParticleTextComponent({
  text = 'HELLO WORLD',
  fontSize = 120,
  particleSize = 3,
  particleColors = ['#ff0000'],
  backgroundColor = '#111111',
  animationSpeed = 5,
  particleDensity = 4,
  effectType = 'explode',
  particleShape = 'circle' // 'circle' | 'square' | 'triangle'
}) {
  const canvasRef = useRef(null);
  const instanceRef = useRef(null);

  useEffect(() => {
    const config = { text, fontSize, particleSize, particleColors, backgroundColor, animationSpeed, particleDensity, effectType, particleShape };
    instanceRef.current = new ParticleText(canvasRef.current, config);
    return () => instanceRef.current.destroy();
  }, []);

  useEffect(() => {
    if (instanceRef.current) {
      instanceRef.current.updateConfig({ text, fontSize, particleSize, particleColors, backgroundColor, animationSpeed, particleDensity, effectType, particleShape });
    }
  }, [text, fontSize, particleSize, particleColors, backgroundColor, animationSpeed, particleDensity, effectType, particleShape]);

  return <canvas ref={canvasRef} style={{ width: '100vw', height: '100vh', display: 'block' }} />;
}
