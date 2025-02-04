"use client"

import { motion } from "framer-motion"
import { useState } from "react"

export function InitialAnimation() {
  const [isVisible, setIsVisible] = useState(true)

  if (!isVisible) return null

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden"
      initial={{ opacity: 1 }}
      animate={{ opacity: 0 }}
      transition={{ duration: 1, delay: 2 }}
      onAnimationComplete={() => setIsVisible(false)}
    >
      <div className="relative w-full h-full">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 animate-background"></div>
        <motion.img
          src="https://res.cloudinary.com/depbfbxtm/image/upload/v1738711994/hg1ktziu6chtoe41fvba.gif"
          alt="GIF"
          className="absolute top-0 left-1/2 transform -translate-x-1/2 w-48 h-48"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        />
        <motion.h1
          className="relative text-6xl font-bold text-gray-800 font-['Reenie_Beanie'] z-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          Unand Bercerita
        </motion.h1>
      </div>
    </motion.div>
  )
}