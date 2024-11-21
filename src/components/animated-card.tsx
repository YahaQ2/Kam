"use client"

import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import Image from "next/image"

interface AnimatedCardProps {
  to: string
  message: string
  song: string
  artist: string
  imageUrl: string
}

export function AnimatedCard({ to, message, song, artist, imageUrl }: AnimatedCardProps) {
  return (
    <motion.div
      className="w-full max-w-sm"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <Card className="bg-white shadow-lg">
        <CardContent className="p-4">
          <p className="text-sm text-gray-500 mb-2">To: {to}</p>
          <p className="text-lg font-handwriting mb-4">{message}</p>
          <div className="flex items-center">
            <Image src={imageUrl} alt={song} width={40} height={40} className="rounded-full mr-2" />
            <div>
              <p className="text-sm font-medium">{song}</p>
              <p className="text-xs text-gray-500">{artist}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

