"use client"

import { motion } from "framer-motion"
import { useState } from "react"

export function InitialAnimation() {
  const [isVisible, setIsVisible] = useState(true)
  
  // Animasi partikel salju
  const snowflakes = Array.from({ length: 30 }).map((_, i) => ({
    id: i,
    x: Math.random() * 100,
    delay: Math.random() * 2,
    duration: 2 + Math.random() * 3
  }))

  if (!isVisible) return null

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-slate-900"
      initial={{ opacity: 1 }}
      animate={{ opacity: 0 }}
      transition={{ duration: 1, delay: 2 }}
      onAnimationComplete={() => setIsVisible(false)}
    >
      {/* Background animasi gradien profesional */}
      <motion.div
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-400/30 via-sky-300/20 to-white/10"
        animate={{
          backgroundPosition: ["0% 0%", "100% 100%", "0% 0%"]
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          repeatType: "loop"
        }}
      />
      
      {/* Partikel salju animasi */}
      {snowflakes.map((flake) => (
        <motion.div
          key={flake.id}
          className="absolute w-2 h-2 bg-white rounded-full shadow-xl"
          style={{
            left: `${flake.x}%`,
            top: "-10%"
          }}
          initial={{ y: 0, opacity: 0 }}
          animate={{
            y: "110vh",
            opacity: [0, 1, 0]
          }}
          transition={{
            delay: flake.delay,
            duration: flake.duration,
            repeat: Infinity,
            repeatType: "loop",
            ease: "linear"
          }}
        />
      ))}

      {/* Konten utama */}
      <div className="relative flex flex-col items-center justify-center w-full h-full">
        <motion.img
          src="https://res.cloudinary.com/depbfbxtm/image/upload/v1738711994/hg1ktziu6chtoe41fvba.gif"
          alt="GIF"
          className="relative w-48 h-48 mb-8"
          initial={{ opacity: 0, y: -50, scale: 0.8 }}
          animate={{ 
            opacity: 1, 
            y: 0, 
            scale: 1,
            rotate: [0, 5, -5, 0] 
          }}
          transition={{ 
            duration: 1.5,
            rotate: {
              duration: 4,
              repeat: Infinity
            }
          }}
        />
        
        <motion.h1
          className="text-6xl font-bold text-white font-['Reenie_Beanie'] text-center drop-shadow-2xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ 
            opacity: 1, 
            y: 0,
            textShadow: "0 0 10px rgba(255,255,255,0.5)"
          }}
          transition={{ 
            duration: 1,
            delay: 0.5 
          }}
        >
          Unand Bercerita
        </motion.h1>
      </div>
    </motion.div>
  )
}