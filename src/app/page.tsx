"use client"

import { useEffect, useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Footer } from "@/components/ui/footer"
import { InitialAnimation } from "@/components/initial-animation"
import { Navbar } from "@/components/ui/navbar"
import Link from "next/link"
import dynamic from "next/dynamic"
import { Sparkles } from "lucide-react"
import { CarouselCard } from "@/components/carousel-card"
import { motion, AnimatePresence } from "framer-motion"

const DynamicCarousel = dynamic(() => import("@/components/carousel").then((mod) => mod.Carousel), {
  ssr: false,
})

const ADMIN_MESSAGES = [
  "semangat untuk hari ini kamu selalu luar biasa",
  "kamu harus jaga kesehatan mu,tidurnya di jaga ya! 😊",
  "Sudahkah kamu menyapa temanmu hari ini? 👋",
  "Cinta itu indah, tapi jangan lupa kuliah! 📚",
  "Tetap semangat dan jaga kesehatan! 💪",
  "Jangan lupa minum air putih hari ini! 💧",
  "Ingat ya, kamu itu spesial dan unik! ✨",
  "Hari ini adalah kesempatan baru untuk berkarya! 🎨",
]

const PopupAdminMessage = () => {
  const [showPopup, setShowPopup] = useState(false)
  const [message, setMessage] = useState("")
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const lastShownDate = localStorage.getItem("popupLastShown")
    const today = new Date().toDateString()

    if (lastShownDate !== today) {
      const randomIndex = Math.floor(Math.random() * ADMIN_MESSAGES.length)
      setMessage(ADMIN_MESSAGES[randomIndex])
      setShowPopup(true)
      localStorage.setItem("popupLastShown", today)

      timeoutRef.current = setTimeout(() => {
        setShowPopup(false)
      }, 100000)
    }

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [])

  const handleClose = () => {
    setShowPopup(false)
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
  }

  return (
    <AnimatePresence>
      {showPopup && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="fixed bottom-4 right-4 z-50 max-w-xs"
        >
          <div className="bg-white rounded-lg shadow-lg p-4 border border-gray-200 relative">
            <button onClick={handleClose} className="absolute top-1 right-1 text-gray-400 hover:text-gray-600">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <Sparkles className="h-6 w-6 text-yellow-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">Pesan Admin</p>
                <p className="text-sm text-gray-500 mt-1">{message}</p>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

interface Menfess {
  id: number
  sender: string
  recipient: string
  message: string
  spotify_id?: string
  track?: {
    title: string
    artist: string
    cover_img: string
  }
  created_at: string
}

interface MenfessResponse {
  status: boolean
  success: boolean
  message: string | null
  data: Menfess[]
}

const VISIBLE_MESSAGES = 8
const SLIDE_DURATION = 8000

const DynamicBackgroundVideo = dynamic(() => import("@/components/background-vidio"), { ssr: false })

export default function HomePage() {
  const [messages, setMessages] = useState<Menfess[][]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isMobile, setIsMobile] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  const shuffleArray = (array: Menfess[]) => {
    const newArray = [...array]
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[newArray[i], newArray[j]] = [newArray[j], newArray[i]]
    }
    return newArray
  }

  const validateMenfess = (data: any): data is Menfess => {
    return (
      typeof data?.id === "number" &&
      typeof data?.sender === "string" &&
      typeof data?.recipient === "string" &&
      typeof data?.message === "string" &&
      typeof data?.created_at === "string"
    )
  }

  const getFormattedDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString("id-ID", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    } catch {
      return "Tanggal tidak valid"
    }
  }

  const getTimeStatus = () => {
    const currentHour = new Date().getHours()
    return {
      isNight: currentHour >= 18 || currentHour < 7,
      isMorning: currentHour >= 7 && currentHour < 18,
    }
  }

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 640)
    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await fetch(`https://unand.vercel.app/v1/api/menfess-spotify-search`)
        if (!response.ok) throw new Error("Gagal memuat pesan")

        const data: MenfessResponse = await response.json()

        if (data?.status && Array.isArray(data.data)) {
          const validMessages = data.data.filter(validateMenfess)
          const shuffled = shuffleArray(validMessages)
          const randomMessages = shuffled.slice(0, VISIBLE_MESSAGES)
          const latestMessages = validMessages.slice(0, VISIBLE_MESSAGES)
          setMessages([randomMessages, latestMessages])
        } else {
          throw new Error("Format data tidak valid")
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Terjadi kesalahan")
        console.error("Fetch error:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchMessages()
  }, [shuffleArray, validateMenfess]) // Added shuffleArray and validateMenfess to dependencies

  useEffect(() => {
    if (messages.length > 0) {
      timeoutRef.current = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % messages.length)
      }, SLIDE_DURATION)
    }

    return () => {
      if (timeoutRef.current) clearInterval(timeoutRef.current)
    }
  }, [messages.length])

  const renderTimeIcon = () => {
    const { isNight } = getTimeStatus()

    return (
      <motion.div
        key={isNight ? "moon" : "sparkles"}
        initial={{ scale: 0 }}
        animate={{ rotate: isNight ? [0, 10, -10, 0] : 0, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative"
      >
        {isNight ? (
          <div className="relative inline-block">
            <motion.div
              className="absolute inset-0 bg-blue-200 rounded-full blur-2xl opacity-30"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY }}
            />
            <motion.span
              className="text-4xl relative z-10"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY }}
            >
              🌙
            </motion.span>
          </div>
        ) : (
          <motion.div
            animate={{ rotate: [0, 20, -20, 0] }}
            transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
            className="relative"
          >
            <div className="absolute inset-0 bg-yellow-200 rounded-full blur-2xl opacity-30" />
            <Sparkles className="h-16 w-16 text-yellow-400 mx-auto relative z-10" />
          </motion.div>
        )}
      </motion.div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-white text-gray-800 relative overflow-hidden">
      <InitialAnimation />
      <Navbar />

      <div className="absolute inset-0 z-0 opacity-20">
        <DynamicBackgroundVideo />
      </div>

      <main className="flex-grow relative z-10">
        <section className="relative overflow-hidden pt-24 pb-16 md:py-32">
          <div className="container mx-auto px-4 text-center">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
              <div className="mb-8">{renderTimeIcon()}</div>
              <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 relative">
                <span className="relative z-10 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
                  Menfess warga Unand
                </span>
              </h1>
              <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto mb-12">
                Sampaikan perasaanmu dengan cara yang berkesan
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex flex-col sm:flex-row justify-center gap-6 mb-16"
            >
              <Button
                asChild
                className="bg-gray-800 text-white px-6 md:px-8 py-2.5 md:py-3 rounded-full hover:bg-gray-900 transition-colors"
              >
                <Link href="/message">Kirim Menfess</Link>
              </Button>
              <Button
                asChild
                className="border-2 border-gray-800 bg-white text-gray-800 px-6 md:px-8 py-2.5 md:py-3 rounded-full hover:bg-gray-100 transition-colors"
              >
                <Link href="/search-message">Explore Menfess</Link>
              </Button>
              <Button
                asChild
                className="border-2 border-blue-600 bg-blue-50 text-blue-600 px-6 md:px-8 py-2.5 md:py-3 rounded-full hover:bg-blue-100 transition-colors"
              >
                <Link href="https://ziwa-351410.web.app">Ziwa - Cari Teman baru & fun space</Link>
              </Button>
            </motion.div>

            <div className="relative w-full max-w-7xl mx-auto overflow-hidden mb-16">
              <DynamicCarousel />
            </div>
          </div>
        </section>

        <PopupAdminMessage />

        <section className="py-16 md:py-24 bg-gray-900 relative">
          <div className="absolute inset-0 opacity-10 bg-[url('/noise.png')]" />
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-300 mb-4">
                {currentSlide === 0 ? "MENFESS ACAK" : "MENFESS TERBARU"}
              </h2>
              <p className="text-gray-400 max-w-xl mx-auto">
                {currentSlide === 0 ? "Pesan-pesan menarik untuk Anda" : "Trending menfess"}
              </p>
            </div>

            {loading ? (
              <div className="h-40 flex items-center justify-center text-gray-300">Memuat...</div>
            ) : error ? (
              <p className="text-red-500 text-center">{error}</p>
            ) : messages.length === 0 ? (
              <p className="text-gray-300 text-center">Tidak ada pesan terbaru</p>
            ) : (
              <div className="relative h-[600px] overflow-hidden">
                <AnimatePresence initial={false} mode="wait">
                  {messages.map(
                    (slideMessages, index) =>
                      currentSlide === index && (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: 100 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -100 }}
                          transition={{ duration: 0.8, ease: "easeInOut" }}
                          className="absolute inset-0 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 px-4"
                        >
                          {slideMessages.map((msg) => (
                            <motion.div
                              key={msg.id}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.4 }}
                            >
                              <Link href={`/message/${msg.id}`} className="block h-full w-full">
                                <div className="h-full w-full bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                                  <div className="px-4 pt-4">
                                    <div className="flex justify-between text-sm mb-2">
                                      <div className="text-gray-300">
                                        <span className="font-semibold">From:</span> {msg.sender}
                                      </div>
                                      <div className="text-gray-300">
                                        <span className="font-semibold">To:</span> {msg.recipient}
                                      </div>
                                    </div>
                                  </div>
                                  <CarouselCard
                                    recipient={msg.recipient || "-"}
                                    sender={msg.sender || "-"}
                                    message={msg.message || "Pesan tidak tersedia"}
                                    songTitle={msg.track?.title}
                                    artist={msg.track?.artist}
                                    coverUrl={msg.track?.cover_img}
                                    spotifyEmbed={
                                      msg.spotify_id && (
                                        <div className="px-4 pb-4">
                                          <iframe
                                            className="w-full rounded-lg shadow-md"
                                            src={`https://open.spotify.com/embed/track/${msg.spotify_id}`}
                                            width="100%"
                                            height="80"
                                            frameBorder="0"
                                            allow="encrypted-media"
                                          />
                                        </div>
                                      )
                                    }
                                  />
                                  <div className="p-4 bg-gray-700 rounded-b-2xl relative">
                                    <div className="absolute top-1 left-1/2 transform -translate-x-1/2 w-24 h-0.5 bg-gray-500 rounded-full" />
                                    <p className="text-sm text-white text-center mt-2">
                                      {getFormattedDate(msg.created_at)}
                                    </p>
                                  </div>
                                </div>
                              </Link>
                            </motion.div>
                          ))}
                        </motion.div>
                      ),
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

