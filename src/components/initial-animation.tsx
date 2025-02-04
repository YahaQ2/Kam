 "use client"

import { motion } from "framer-motion"
import { useState } from "react"

export function InitialAnimation() {
  const [isVisible, setIsVisible] = useState(true)

  if (!isVisible) return null

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-gradient-to-b from-blue-500 to-white"
      initial={{ opacity: 1 }}
      animate={{ opacity: 0 }}
      transition={{ duration: 1, delay: 2 }}
      onAnimationComplete={() => setIsVisible(false)}
    >
      {/* Background salju dengan CSS */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[url('/snow.gif')] opacity-30"></div>
      </div>

      {/* Kontainer animasi */}
      <div className="relative flex flex-col items-center">
        {/* Animasi GIF */}
        <motion.img
          src="https://res.cloudinary.com/depbfbxtm/image/upload/v1738711994/hg1ktziu6chtoe41fvba.gif"
          alt="GIF"
          className="w-48 h-48"
          initial={{ opacity: 0, y: -50, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 1 }}
        />

        {/* Animasi teks */}
        <motion.h1
          className="text-6xl font-bold text-gray-800 font-['Poppins'] mt-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5 }}
        >
          Unand Bercerita
        </motion.h1>
      </div>
    </motion.div>
  )
}