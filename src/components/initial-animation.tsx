"use client"

import { motion } from "framer-motion"

export function InitialAnimation() {
  return (
    <motion.div
      className="fixed inset-0 bg-white z-50 flex items-center justify-center"
      initial={{ opacity: 1 }}
      animate={{ opacity: 0 }}
      transition={{ duration: 1, delay: 2 }}
    >
      <motion.h1
        className="text-4xl font-bold text-gray-800"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
      >
        Polines Bercerita
      </motion.h1>
    </motion.div>
  )
}

