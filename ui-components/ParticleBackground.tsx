// 科技感粒子流背景组件
// 文件路径: components/ParticleBackground.tsx

'use client'

import React, { useEffect, useRef } from 'react'

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  opacity: number
  color: string
}

const ParticleBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>()
  const particlesRef = useRef<Particle[]>([])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // 设置画布尺寸
    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    // 初始化粒子
    const initParticles = () => {
      const particles: Particle[] = []
      const particleCount = Math.floor((canvas.width * canvas.height) / 15000) // 根据屏幕大小调整粒子数量

      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.5, // 水平速度
          vy: (Math.random() - 0.5) * 0.5, // 垂直速度
          size: Math.random() * 2 + 0.5,   // 粒子大小
          opacity: Math.random() * 0.8 + 0.2, // 透明度
          color: getRandomColor()
        })
      }

      particlesRef.current = particles
    }

    // 获取随机颜色（蓝紫渐变色系）
    const getRandomColor = () => {
      const colors = [
        '#00d4ff', // 亮蓝色
        '#0099cc', // 中蓝色
        '#6666ff', // 蓝紫色
        '#9c27b0', // 紫色
        '#ff6b9d', // 粉紫色
      ]
      return colors[Math.floor(Math.random() * colors.length)]
    }

    // 绘制粒子
    const drawParticles = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      particlesRef.current.forEach((particle, index) => {
        // 更新粒子位置
        particle.x += particle.vx
        particle.y += particle.vy

        // 边界检测和反弹
        if (particle.x < 0 || particle.x > canvas.width) {
          particle.vx *= -1
        }
        if (particle.y < 0 || particle.y > canvas.height) {
          particle.vy *= -1
        }

        // 保持粒子在画布内
        particle.x = Math.max(0, Math.min(canvas.width, particle.x))
        particle.y = Math.max(0, Math.min(canvas.height, particle.y))

        // 绘制粒子
        ctx.save()
        ctx.globalAlpha = particle.opacity
        ctx.fillStyle = particle.color
        ctx.shadowBlur = 10
        ctx.shadowColor = particle.color
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
        ctx.fill()
        ctx.restore()

        // 绘制连接线
        particlesRef.current.forEach((otherParticle, otherIndex) => {
          if (index !== otherIndex) {
            const dx = particle.x - otherParticle.x
            const dy = particle.y - otherParticle.y
            const distance = Math.sqrt(dx * dx + dy * dy)

            // 只在距离较近时绘制连接线
            if (distance < 100) {
              const opacity = (100 - distance) / 100 * 0.3
              ctx.save()
              ctx.globalAlpha = opacity
              ctx.strokeStyle = particle.color
              ctx.lineWidth = 0.5
              ctx.beginPath()
              ctx.moveTo(particle.x, particle.y)
              ctx.lineTo(otherParticle.x, otherParticle.y)
              ctx.stroke()
              ctx.restore()
            }
          }
        })
      })
    }

    // 动画循环
    const animate = () => {
      drawParticles()
      animationRef.current = requestAnimationFrame(animate)
    }

    initParticles()
    animate()

    // 鼠标交互效果
    const handleMouseMove = (event: MouseEvent) => {
      const mouseX = event.clientX
      const mouseY = event.clientY

      particlesRef.current.forEach(particle => {
        const dx = mouseX - particle.x
        const dy = mouseY - particle.y
        const distance = Math.sqrt(dx * dx + dy * dy)

        // 鼠标附近的粒子会被吸引
        if (distance < 150) {
          const force = (150 - distance) / 150 * 0.01
          particle.vx += dx * force
          particle.vy += dy * force
        }
      })
    }

    canvas.addEventListener('mousemove', handleMouseMove)

    // 清理函数
    return () => {
      window.removeEventListener('resize', resizeCanvas)
      canvas.removeEventListener('mousemove', handleMouseMove)
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-full h-full -z-10 pointer-events-none"
      style={{
        background: 'linear-gradient(135deg, #0a0e1a 0%, #1a1f2e 100%)'
      }}
    />
  )
}

export default ParticleBackground

/* 
使用方法：
1. 将此组件放在应用的根布局中
2. 确保z-index设置为负值，作为背景
3. pointer-events-none确保不影响其他交互

在 layout.tsx 中使用：
import ParticleBackground from '@/components/ParticleBackground'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh">
      <body>
        <ParticleBackground />
        {children}
      </body>
    </html>
  )
}

性能优化建议：
1. 根据设备性能调整粒子数量
2. 在移动设备上减少粒子数量
3. 可以添加开关让用户选择是否启用动画
*/
