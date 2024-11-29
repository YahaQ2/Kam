"use client"

import React, { useRef, useState } from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { motion } from "framer-motion"

interface MobileCarouselCardProps {
  to: string
  from: string
  message: string
}

export const MobileCarouselCard: React.FC<MobileCarouselCardProps> = ({ to, from, message }) => {
  const [currentCard, setCurrentCard] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  const cards = [
    { title: 'To', content: to },
    { title: 'From', content: from },
    { title: 'Message', content: message },
  ]

  const handleScroll = () => {
    if (containerRef.current) {
      const scrollPosition = containerRef.current.scrollLeft
      const cardWidth = containerRef.current.offsetWidth
      const newCard = Math.round(scrollPosition / cardWidth)
      setCurrentCard(newCard)
    }
  }

  return (
    <div className="w-full max-w-sm mx-auto my-4 overflow-hidden">
      <div 
        ref={containerRef}
        className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide"
        onScroll={handleScroll}
      >
        {cards.map((card, index) => (
          <Card key={index} className="w-full flex-shrink-0 snap-center">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-2">{card.title}</h3>
              <p className="text-gray-600">{card.content}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="flex justify-center space-x-2 mt-4">
        {cards.map((_, index) => (
          <motion.div
            key={index}
            className={`h-2 w-2 rounded-full ${currentCard === index ? 'bg-gray-800' : 'bg-gray-300'}`}
            initial={false}
            animate={{ scale: currentCard === index ? 1.2 : 1 }}
          />
        ))}
      </div>
    </div>
  )
}

