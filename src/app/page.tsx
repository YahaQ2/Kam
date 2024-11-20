"use client";

import { useState } from 'react'
import { motion } from 'framer-motion'

export default function LandingPage() {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center text-black p-4">
      <motion.h1 
        className="text-4xl md:text-6xl font-bold mb-4 text-center"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        Polines Menfes
      </motion.h1>
      <motion.p 
        className="text-xl md:text-2xl mb-8 text-center max-w-2xl"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        Website khusus mengirim pesan rahasia untuk masyarakat Polines
      </motion.p>
      <motion.button
        className={`bg-black hover:bg-gray-800 text-white font-bold py-3 px-6 rounded-full text-lg transition-all duration-300 ease-in-out transform ${isHovered ? 'scale-105' : 'scale-100'}`}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        Mulai Kirim Pesan
      </motion.button>
      <motion.div 
        className="mt-16 text-gray-600"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <p>Aman • Rahasia • Terpercaya</p>
      </motion.div>
    </div>
  )
}