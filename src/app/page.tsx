"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { AnimatedCard } from "@/components/animated-card"
import { Footer } from "@/components/ui/footer"
import { InitialAnimation } from "@/components/initial-animation"

const messages = [
  { to: "axel", message: "i hope someday i'll be brave enough to tell u how much u meant to me", song: "Pluto Projector", artist: "Rex Orange County", imageUrl: "/placeholder.svg?height=40&width=40" },
  { to: "lyra", message: "everything reminds me of u, even that warteg tempat kita first hangout", song: "Head In The Clouds", artist: "88rising, Joji", imageUrl: "/placeholder.svg?height=40&width=40" },
  { to: "tara", message: "masih inget how your smile made everything feel okay... i miss that feeling", song: "Nothing's Gonna Hurt You Baby", artist: "Cigarettes After Sex", imageUrl: "/placeholder.svg?height=40&width=40" },
  // Tambah disini
]

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white text-gray-800">
      <InitialAnimation />
      <header className="flex justify-between items-center p-6 border-b border-gray-200">
        <h1 className="text-3xl font-bold">Solifess</h1>
        <nav className="space-x-4">
          <Button variant="ghost" className="text-gray-800 hover:text-gray-600">Kirim</Button>
          <Button variant="ghost" className="text-gray-800 hover:text-gray-600">Jelajahi</Button>
          <Button variant="ghost" className="text-gray-800 hover:text-gray-600">Dukungan</Button>
        </nav>
      </header>
      <main className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-4xl font-bold mb-6">Ungkapan Perasaan Masyarakat Solinep</h2>
        <p className="text-lg mb-12">aaaaaaaaaaaaaaaaaaaaaaaaaaa isi apa</p>
        <div className="flex justify-center space-x-4 mb-16">
          <Button className="bg-gray-800 text-white px-8 py-3 rounded-full hover:bg-gray-900 transition-colors">Kirim Perasaan</Button>
          <Button className="border-2 border-gray-800 bg-white text-gray-800 px-8 py-3 rounded-full hover:bg-gray-100 transition-colors">Temukan Perasaan</Button>
        </div>
        <div className="overflow-hidden">
          <motion.div 
            className="flex gap-8"
            animate={{
              x: ["0%", "-100%"],
            }}
            transition={{
              x: {
                repeat: Infinity,
                repeatType: "loop",
                duration: 30,
                ease: "linear",
              },
            }}
          >
            {messages.concat(messages).map((msg, index) => (
              <AnimatedCard
                key={index}
                to={msg.to}
                message={msg.message}
                song={msg.song}
                artist={msg.artist}
                imageUrl={msg.imageUrl}
              />
            ))}
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

