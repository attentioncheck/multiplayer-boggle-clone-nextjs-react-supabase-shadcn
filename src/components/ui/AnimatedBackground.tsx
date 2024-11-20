'use client'

import React, { useEffect, useRef, useState } from 'react'
import anime from 'animejs'
import { Code, Layout, Database, Smartphone, Store } from 'lucide-react'

export default function Component() {
  const animationsRef = useRef<anime.AnimeInstance[]>([])
  const [opacity, setOpacity] = useState(1)
  const containerRef = useRef<HTMLDivElement>(null)
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      if (window.innerWidth < 768) {
        setScrollY(window.scrollY)
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const symbols = document.querySelectorAll('.web-symbol')
    const animations: anime.AnimeInstance[] = []

    // Initial fade-in animation with longer delay
    animations.push(
      anime({
        targets: symbols,
        scale: [0, 1],
        opacity: [0, 1],
        delay: anime.stagger(200, {start: 1000}), // Delay start by 1 second
        rotate: () => anime.random(-15, 15),
        easing: 'easeOutExpo',
        duration: 2000,
        complete: () => {
          // Start continuous animations after fade-in
          startContinuousAnimations()
        }
      })
    )

    function startContinuousAnimations() {
      // Continuous animations
      symbols.forEach((symbol) => {
        animations.push(
          anime({
            targets: symbol,
            translateX: () => anime.random(-50, 50),
            translateY: () => anime.random(-50, 50),
            scale: {
              value: [1, 1.3],
              duration: 4000,
              easing: 'easeInOutQuad',
            },
            rotate: () => anime.random(-20, 20),
            duration: 8000,
            easing: 'easeInOutQuad',
            direction: 'alternate',
            loop: true,
          })
        )
      })

      // Additional animations for database and store symbols
      const dbStoreSymbols = document.querySelectorAll('.database-symbol, .store-symbol')
      dbStoreSymbols.forEach((symbol) => {
        animations.push(
          anime({
            targets: symbol,
            translateX: () => anime.random(-70, 70),
            translateY: () => anime.random(-70, 70),
            rotate: () => anime.random(-30, 30),
            duration: 10000,
            easing: 'easeInOutQuad',
            direction: 'alternate',
            loop: true,
          })
        )
      })
    }

    animationsRef.current = animations

    // Set up Intersection Observer
    const observer = new IntersectionObserver(
      ([entry]) => {
        // Update opacity based on intersection ratio
        // Using a quadratic function to make the fade effect faster
        setOpacity(Math.pow(entry.intersectionRatio, 6))
      },
      {
        threshold: new Array(101).fill(0).map((_, i) => i / 100), // Create thresholds for each percentage point
      }
    )

    const currentContainer = containerRef.current
    if (currentContainer) {
      observer.observe(currentContainer)
    }

    return () => {
      animations.forEach(animation => animation.pause())
      if (currentContainer) {
        observer.unobserve(currentContainer)
      }
    }
  }, [])

  return (
    <div 
      ref={containerRef}
      className="absolute inset-0 overflow-hidden bg-white"
      style={{ opacity }}
      aria-hidden="true"
    >
      <div className="absolute inset-0 flex items-center justify-center">
        <div 
          className="web-symbol absolute top-[75vh] md:top-1/4 left-[20%] md:left-1/4 text-[#90bede]"
          style={{ transform: `translateY(${scrollY * 0.5}px)` }}
        >
          <Code size={64} />
        </div>
        <div 
          className="web-symbol absolute top-[70vh] md:top-1/4 left-[30%] md:left-1/3 text-[#68edc6]"
          style={{ transform: `translateY(${scrollY * 0.4}px)` }}
        >
          <Layout size={60} />
        </div>
        <div 
          className="web-symbol database-symbol absolute top-[75vh] md:bottom-1/4 left-[40%] md:left-[40%] text-[#3378aa]"
          style={{ transform: `translateY(${scrollY * 0.6}px)` }}
        >
          <Database size={56} />
        </div>
        <div 
          className="web-symbol absolute top-[75vh] md:bottom-1/3 left-[50%] md:left-1/3 text-[#225071]"
          style={{ transform: `translateY(${scrollY * 0.3}px)` }}
        >
          <Smartphone size={58} />
        </div>
        <div 
          className="web-symbol store-symbol absolute top-[80vh] md:top-1/4 left-[60%] md:left-[40%] text-[#90f3ff]"
          style={{ transform: `translateY(${scrollY * 0.45}px)` }}
        >
          <Store size={62} />
        </div>
      </div>
    </div>
  )
}