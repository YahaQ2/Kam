"use client"

import { useState, useLayoutEffect, useRef } from 'react'
import { motion, useAnimation, useMotionValue } from 'framer-motion'
import { TickerCard } from './ticket-card'

const messages = [
  { to: "al hme", from: "-", message: "kapan kita bisa main bareng?" },
  { to: "semua anak unand", from: "me", message: "guys jgn lupa jaga kebersihan klo udh makan minum, bungkus sampahnya WAJIB dibuang di tong sampah, meski di kantin jg harus begitu. dah gede ayo sadar kebersihan" },
  { to: "tesmank", from: "aldi", message: "Makasih yah guyss🤜🏻 maaf fitur comment belum tersedia masih ada bug soalnya lagi update tanggal 15 bisa dipakai sama, and nanti ada bikin fitur kuisioner nanti kalian bisa upload kuisoner kalian. tinggal upload link kuisioner kalian dan yang ngisi bkal dapet voucher internet atau saldo ewallet gratis ini fiturnya ada iklan ya guys untuk fitur ini di tambahin atau ga usah di beda web aja? Kalian tinggal bilang di tombol saran. Note iklannya di fitur kuisoner aja bukan di tampilan yunandfess." },
  { to: "bang", from: "a", message: "Semangatt bang, semoga segera wisuda yaaa. tutor dong jadi berkarisma" },
  { to: "kelas a", from: "c", message: "Hy Varel, sehat selalu ya :)" },
  { to: "mas-mas kandok", from: "ijo", message: "Kasih saran buat nambahin fitur baru" },
  { to: "mas-mas kandok", from: "ijo", message: "semangat" },
]

export const Carousel: React.FC = () => {
  const [width, setWidth] = useState(0)
  const carousel = useRef<HTMLDivElement>(null)
  const x = useMotionValue(0)
  const controls = useAnimation()

  useLayoutEffect(() => {
    if (carousel.current) {
      setWidth(carousel.current.scrollWidth - carousel.current.offsetWidth)
    }
  }, [])

  useLayoutEffect(() => {
    let isMounted = true;
    let animationFrame: number;

    const scrollAnimation = async () => {
      if (!isMounted) return;

      await controls.start({
        x: -width,
        transition: {
          duration: 70,
          ease: "linear",
        },
      })

      if (isMounted) {
        controls.set({ x: 0 })
        animationFrame = requestAnimationFrame(scrollAnimation)
      }
    }

    scrollAnimation()

    return () => {
      isMounted = false;
      if (animationFrame) {
        cancelAnimationFrame(animationFrame)
      }
      controls.stop()
    }
  }, [controls, width])

  const tripleMessages = [...messages, ...messages, ...messages]

  return (
    <div className="relative w-full max-w-7xl mx-auto">
      <div className="absolute left-0 top-0 w-32 h-full bg-gradient-to-r from-white via-white to-transparent z-10" />
      <div className="absolute right-0 top-0 w-32 h-full bg-gradient-to-l from-white via-white to-transparent z-10" />
      
      <motion.div
        ref={carousel}
        className="cursor-grab overflow-hidden"
        whileTap={{ cursor: "grabbing" }}
      >
        <motion.div
          className="flex space-x-4 py-4"
          style={{ x }}
          animate={controls}
        >
          {tripleMessages.map((msg, index) => (
            <motion.div
              key={`${msg.to}-${index}`}
              className="flex-none"
            >
              <TickerCard {...msg} />
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </div>
  )
}

