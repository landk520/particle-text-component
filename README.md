# particle-text-component
粒子文字效果

## 使用方法
```
import ParticleTextComponent from 'particle-text-component';

function App() {
  return (
    <ParticleTextComponent
      text="彩色粒子" // 文字
      fontSize={140} // 文字大小
      particleSize={4} // 粒子大小
      particleColors={['#ff0000', '#fe9900', '#98f5f9']} // 粒子颜色
      backgroundColor="#000000" // 背景颜色
      animationSpeed={6}  // 动画速度1-10
      particleDensity={5} // 粒子密度1-10
      effectType="flow" // 粒子效果类型：flow、bubble、ripple
      particleShape="triangle" // 粒子形状：circle、square、triangle
    />
  );
}

```
