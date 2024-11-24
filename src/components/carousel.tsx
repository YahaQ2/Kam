"use client"

import { useState, useEffect, useRef } from 'react'
import { motion, useAnimation, useMotionValue } from 'framer-motion'
import { CarouselCard } from './carousel-card'

const messages = [
  { to: "wahyu", from: "aldi", message: "woi wong secang, tes tes" },
  { to: "dipha", from: "aldi", message: "bang heker" },
  { to: "tara", from: "anonymous", message: "masih inget how your smile made everything feel okay... i miss that feeling" },
  { to: "emil", from: "anonymous", message: "wish i could forget how safe it felt being around you dulu" },
  { to: "vanya", from: "anonymous", message: "funny how someone bisa jadi stranger padahal they knew all your secrets" },
  { to: "marcel", from: "anonymous", message: "i still use the playlist u made pas aku sedih... it still helps somehow" },
]

export const Carousel: React.FC = () => {
  const [width, setWidth] = useState(0)
  const carousel = useRef<HTMLDivElement>(null)
  const x = useMotionValue(0)
  const controls = useAnimation()

  useEffect(() => {
    if (carousel.current) {
      setWidth(carousel.current.scrollWidth - carousel.current.offsetWidth)
    }
  }, [])

  useEffect(() => {
    const scrollAnimation = async () => {
      while (true) {
        await controls.start({
          x: -width,
          transition: {
            duration: 60,
            ease: "linear",
          },
        })
        await controls.set({ x: 0 })
      }
    }
    scrollAnimation()
  }, [controls, width])

  const tripleMessages = [...messages, ...messages, ...messages]

  return (
    <div className="relative w-full max-w-7xl mx-auto">
      {/* Gradient Masks */}
      <div className="absolute left-0 top-0 w-32 h-full bg-gradient-to-r from-white via-white to-transparent z-10" />
      <div className="absolute right-0 top-0 w-32 h-full bg-gradient-to-l from-white via-white to-transparent z-10" />
      
      <motion.div
        ref={carousel}
        className="cursor-grab overflow-hidden px-8"
        whileTap={{ cursor: "grabbing" }}
      >
        <motion.div
          className="flex"
          style={{ x }}
          animate={controls}
        >
          {tripleMessages.map((msg, index) => (
            <motion.div
              key={`${msg.to}-${index}`}
              className="flex-none px-3"
            >
              <CarouselCard {...msg} />
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </div>
  )
}