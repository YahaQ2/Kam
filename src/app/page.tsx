"use client"

import { Button } from "@/components/ui/button"
import { Carousel } from "@/components/carousel"
import { Footer } from "@/components/ui/footer"
import { InitialAnimation } from "@/components/initial-animation"
import { Navbar } from "@/components/ui/navbar"
import Link from "next/link"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white text-gray-800">
      <InitialAnimation />
      <Navbar />
      <main className="container mx-auto px-4 py-8 md:py-16 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-4 md:mb-6">
          Ungkapan Perasaan Masyarakat Solinep
        </h2>
        <p className="text-base md:text-lg mb-8 md:mb-12">Terbangkan perasaanmu</p>
        <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4 mb-12 md:mb-16">
          <Button
            asChild
            className="bg-gray-800 text-white px-6 md:px-8 py-2.5 md:py-3 rounded-full hover:bg-gray-900 transition-colors"
          >
            <Link href="/message">Mulai Bercerita</Link>
          </Button>
          <Button
            asChild
            className="border-2 border-gray-800 bg-white text-gray-800 px-6 md:px-8 py-2.5 md:py-3 rounded-full hover:bg-gray-100 transition-colors"
          >
            <Link href="/temukan-cerita">Temukan Cerita</Link>
          </Button>
        </div>
        <div className="relative w-full max-w-7xl mx-auto overflow-hidden">
          <Carousel />
        </div>
      </main>
      <Footer />
    </div>
  )
}