"use client"

import { useState, useLayoutEffect, useRef } from 'react'
import { motion, useAnimation, useMotionValue } from 'framer-motion'
import { TickerCard } from './ticket-card'

const messages = [
  { to: "al hme", from: "-", message: "kapan kita bisa main bareng?" },
  { to: "semua anak unand", from: "me", message: "guys jgn lupa jaga kebersihan klo udh makan minum, bungkus sampahnya WAJIB dibuang di tong sampah, meski di kantin jg harus begitu. dah gede ayo sadar kebersihan" },
  { to: "tesmank", from: "aldi", message: "jgn lupa me time" },
  { to: "bang", from: "a", message: "Semangatt bang, semoga segera wisuda yaaa. tutor dong jadi berkarisma" },
  { to: "kelas a", from: "c", message: "kak dirimu sangat Masya Allah aselii" },
    { to: "yunend", from: "admin", message: "suport ya,dari admin fer (yang paling ganteng" },
  { to: "mas-mas kandok", from: "ijo", message: "😓🖤" },
    { to: "mbaks2", from: "admin fer", message: "hai semoga kamu coba ya 22-08-23" },
   { to: "Rafi", from: "Aldi", message: "Selamat pagi!" },
{ to: "Nisa", from: "Joko", message: "Kamu sangat berarti." },
{ to: "Tono", from: "Lestari", message: "Terima kasih." },
{ to: "Dina", from: "Rino", message: "" },
{ to: "Aldo", from: "Mela", message: "Kamu spesial!" },
{ to: "Yuni", from: "Awan", message: "Semoga bahagia!" },
{ to: "Bowo", from: "Lina", message: "Janji bertemu 1-1-2025!" },
{ to: "Cinta", from: "Rendi", message: "Selamat ulang tahun!" },
{ to: "Dewi", from: "Bayu", message: "Kita ketemu lagi 15-6-2025." },
{ to: "Rosa", from: "Kiko", message: "Hai, apa kabar?" },
{ to: "Budi", from: "Andi", message: "Kabar baik?" },
{ to: "Lia", from: "Fani", message: "Halo!" },
{ to: "Ayu", from: "Rama", message: "Kamu cantik!" },
{ to: "Joni", from: "Lesti", message: "Semoga sukses!" },
{ to: "Tika", from: "Boni", message: "Kamu hebat!" },
{ to: "Widi", from: "Tono", message: "Kamu pintar!" },
{ to: "Lulu", from: "Uci", message: "Kamu baik!" },
{ to: "Mimi", from: "Gigi", message: "Kamu cerdas!" },
{ to: "Nuri", from: "Ipul", message: "Kamu kuat!" },
{ to: "Tuti", from: "Amir", message: "Kamu cantik!" },
{ to: "Wawan", from: "Sari", message: "Hai, kabar?" },
{ to: "Lala", from: "Miko", message: "Kamu hebat!" },
{ to: "Tata", from: "Dedi", message: "Semoga bahagia!" },
{ to: "Mama", from: "Papa", message: "Kamu cantik!" },
{ to: "Kiki", from: "Lulu", message: "Kamu pintar!" },
{ to: "Baba", from: "Mama", message: "Kamu kuat!" },
{ to: "Nana", from: "Papa", message: "Kamu baik!" },
{ to: "Toto", from: "Mama", message: "Kamu cerdas!" },
{ to: "Gigi", from: "Lulu", message: "Kamu hebat!" },
{ to: "Jiji", from: "Miko", message: "Semoga sukses!" },
{ to: "Cici", from: "Papa", message: "Kamu cantik!" },
{ to: "Dede", from: "Mama", message: "Kamu pintar!" },
{ to: "Eva", from: "Rudi", message: "Kamu baik!" },
{ to: "Fani", from: "Boni", message: "Kamu kuat!" },
{ to: "Gino", from: "Lina", message: "Kamu cerdas!" },
{ to: "Hana", from: "Joko", message: "Kamu hebat!" },
{ to: "Ina", from: "Rino", message: "Semoga bahagia!" },
{ to: "Jani", from: "Mela", message: "Kamu cantik!" },
{ to: "Koko", from: "Lesti", message: "Kamu pintar!" },
{ to: "Lena", from: "Budi", message: "Kamu baik!" },
{ to: "Mika", from: "Andi", message: "Kamu kuat!" },
{ to: "Nino", from: "Tono", message: "Kamu cerdas!" },
{ to: "Ola", from: "Aldi", message: "Hai" },
    
    
    
    
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

