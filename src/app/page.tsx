"use client"

import { Button } from "@/components/ui/button"
import { Carousel } from "@/components/carousel"
import { Footer } from "@/components/ui/footer"
import { InitialAnimation } from "@/components/initial-animation"
import { useState } from "react"
import { Menu, X } from "lucide-react"

export default function HomePage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-white text-gray-800">
      <InitialAnimation />
      <header className="sticky top-0 z-0 bg-white/80 backdrop-blur-sm border-b border-gray-200">
        <div className="container mx-auto flex justify-between items-center p-4 md:p-6">
          <h1 className="text-2xl md:text-3xl font-bold">solifess</h1>
          
          {/* Mobile Menu Button */}
          <button 
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-4">
            <Button variant="ghost" className="text-gray-800 hover:text-gray-600">Kirim</Button>
            <Button variant="ghost" className="text-gray-800 hover:text-gray-600">Jelajahi</Button>
            <Button variant="ghost" className="text-gray-800 hover:text-gray-600">Dukungan</Button>
          </nav>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="md:hidden border-t border-gray-100 bg-white">
            <div className="flex flex-col space-y-2 p-4">
              <Button variant="ghost" className="w-full justify-start text-gray-800 hover:text-gray-600">
                Kirim
              </Button>
              <Button variant="ghost" className="w-full justify-start text-gray-800 hover:text-gray-600">
                Jelajahi
              </Button>
              <Button variant="ghost" className="w-full justify-start text-gray-800 hover:text-gray-600">
                Dukungan
              </Button>
            </div>
          </nav>
        )}
      </header>

      <main className="container mx-auto px-4 py-8 md:py-16 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-4 md:mb-6">
          Ungkapan Perasaan Masyarakat Solinep
        </h2>
        <p className="text-base md:text-lg mb-8 md:mb-12">
          Terbangkan perasaanmu
        </p>
        <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4 mb-12 md:mb-16">
          <Button className="bg-gray-800 text-white px-6 md:px-8 py-2.5 md:py-3 rounded-full hover:bg-gray-900 transition-colors">
            Mulai Bercerita
          </Button>
          <Button className="border-2 border-gray-800 bg-white text-gray-800 px-6 md:px-8 py-2.5 md:py-3 rounded-full hover:bg-gray-100 transition-colors">
            Temukan Cerita
          </Button>
        </div>
        <div className="w-full max-w-5xl mx-auto">
          <Carousel />
        </div>
      </main>
      
      <Footer />
    </div>
  )
}