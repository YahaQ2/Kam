"use client"

import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Navbar } from "@/components/ui/navbar"
import { Footer } from "@/components/ui/footer"
import { useEffect, useState } from "react"
import dayjs from "dayjs"
import utc from "dayjs/plugin/utc"
import timezone from "dayjs/plugin/timezone"
import { Loader2, Twitter, Facebook, Link2, MessageCircle, Instagram, Share2 } from "lucide-react"

dayjs.extend(utc)
dayjs.extend(timezone)

type MessageType = {
  id: number
  sender: string
  recipient: string
  message: string
  gif_url: string
  spotify_id?: string
  created_at: string
}

interface ShareMenuProps {
  message: string
  id: string
  onShare: (platform: string) => void
}

const getShareUrl = (id: string): string => {
  if (typeof window === 'undefined') return ''
  return new URL(`/message/${id}`, window.location.origin).toString()
}

const detectInappropriateWords = (message: string): boolean => {
  const inappropriateWordsRegex = /fuck|kontol|pantek|pntk|fck|kntl|kampang|jablay|lonte|bangsat|memek/i
  return inappropriateWordsRegex.test(message)
}

const detectUnandWords = (message: string): boolean => {
  const unandWordsRegex = /unand|yunand|yunend|unend|unands/i
  return unandWordsRegex.test(message)
}

const detectLoveMessage = (message: string): boolean => {
  const loveWordsRegex = /love|cinta|sayang|suka|crush/i
  return !detectInappropriateWords(message) && loveWordsRegex.test(message)
}

const ShareMenu = ({ message, id, onShare }: ShareMenuProps) => {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    if (!isOpen) return

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (!target.closest('.share-menu-container')) {
        setIsOpen(false)
      }
    }

    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [isOpen])

  return (
    <div className="relative share-menu-container">
      <Button onClick={() => setIsOpen(!isOpen)}>
        <Share2 className="w-4 h-4 mr-2" />
        Share
      </Button>
      
      {isOpen && (
        <div className="absolute left-0 mt-2 bg-white rounded-lg shadow-xl p-2 space-y-2 min-w-[200px] z-50 border border-gray-200">
          <Button
            onClick={() => { onShare("whatsapp"); setIsOpen(false) }}
            variant="ghost"
            className="w-full justify-start text-gray-700 hover:bg-gray-50"
          >
            <MessageCircle className="w-4 h-4 mr-2 text-green-600" />
            WhatsApp
          </Button>
          
          <Button
            onClick={() => { onShare("facebook"); setIsOpen(false) }}
            variant="ghost"
            className="w-full justify-start text-gray-700 hover:bg-gray-50"
          >
            <Facebook className="w-4 h-4 mr-2 text-blue-600" />
            Facebook
          </Button>
          
          <Button
            onClick={() => { onShare("twitter"); setIsOpen(false) }}
            variant="ghost"
            className="w-full justify-start text-gray-700 hover:bg-gray-50"
          >
            <Twitter className="w-4 h-4 mr-2 text-blue-400" />
            Twitter
          </Button>
          
          <Button
            onClick={() => { onShare("instagram"); setIsOpen(false) }}
            variant="ghost"
            className="w-full justify-start text-gray-700 hover:bg-gray-50"
          >
            <Instagram className="w-4 h-4 mr-2 text-pink-600" />
            Instagram
          </Button>
          
          <Button
            onClick={() => { onShare("copy"); setIsOpen(false) }}
            variant="ghost"
            className="w-full justify-start text-gray-700 hover:bg-gray-50"
          >
            <Link2 className="w-4 h-4 mr-2 text-gray-600" />
            Copy Link
          </Button>
        </div>
      )}
    </div>
  )
}

const SpotifyEmbed = ({ trackId }: { trackId?: string | null }) => {
  if (!trackId) return null

  return (
    <iframe
      src={`https://open.spotify.com/embed/track/${trackId}?utm_source=generator`}
      width="100%"
      height="152"
      className="rounded-lg mt-6"
      allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
      loading="lazy"
    />
  )
}

export default function MessageClient({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { id } = params
  const [message, setMessage] = useState<MessageType | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [imageError, setImageError] = useState(false)

  useEffect(() => {
    const fetchMessage = async () => {
      setIsLoading(true)
      try {
        const response = await fetch(`https://unand.vercel.app/v1/api/menfess-spotify-search/${id}`)
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
        
        const data = await response.json()
        if (!data?.status || !data?.data?.[0]) throw new Error("Invalid data format")
        
        setMessage(data.data[0])
      } catch (error) {
        console.error("Error fetching message:", error)
        setMessage(null)
      } finally {
        setIsLoading(false)
      }
    }

    fetchMessage()
  }, [id])

  const handleShare = (platform: string) => {
    const shareUrl = getShareUrl(id)
    const shareText = `Check out this message I received: ${message?.message}`
    const imageUrl = `https://unand.vercel.app/api/og-image/${id}`

    switch (platform) {
      case "twitter":
        window.open(
          `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
          "_blank"
        )
        break
      case "facebook":
        window.open(
          `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
          "_blank"
        )
        break
      case "whatsapp":
        window.open(
          `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText + " " + shareUrl)}`,
          "_blank"
        )
        break
      case "instagram":
        window.open(imageUrl, "_blank")
        break
      case "copy":
        if (navigator?.clipboard) {
          navigator.clipboard
            .writeText(shareUrl)
            .then(() => {
              alert("Link copied to clipboard!")
            })
            .catch(console.error)
        }
        break
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  if (!message) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl font-semibold text-gray-600">Message not found</p>
      </div>
    )
  }

  const formattedDate = dayjs.utc(message.created_at).tz("Asia/Jakarta").format("DD MMM YYYY, HH:mm")
  const hasInappropriateWords = detectInappropriateWords(message.message)
  const hasUnandWords = detectUnandWords(message.message)
  const isLoveMessage = detectLoveMessage(message.message)

  const getBackgroundColor = () => {
    if (hasInappropriateWords) return "bg-red-50"
    if (isLoveMessage) return "bg-pink-50"
    return "bg-white"
  }

  return (
    <div className="min-h-screen bg-white text-gray-800 flex flex-col">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-32">
        <Button onClick={() => router.back()} className="mb-8 bg-gray-800 text-white hover:bg-gray-900">
          Back
        </Button>
        <div className={`max-w-2xl mx-auto shadow-lg rounded-lg overflow-hidden ${getBackgroundColor()} relative`}>
          {isLoveMessage && (
            <div 
              className="absolute inset-0 bg-cover bg-center opacity-10" 
              style={{ backgroundImage: "url('https://res.cloudinary.com/depbfbxtm/image/upload/v1738829131/dkncarmepvddfdt93cxj.png')" }} 
            />
          )}
          
          {hasUnandWords && !hasInappropriateWords && (
            <div 
              className="absolute inset-0 bg-cover bg-center opacity-10" 
              style={{ backgroundImage: "url('https://res.cloudinary.com/depbfbxtm/image/upload/v1738897074/IMG_20250207_095652_727_gsfzyg.jpg')" }} 
            />
          )}

          <div className="p-8 relative z-10">
            <div className="mb-6">
              <p className="text-sm text-gray-500">To: {message.recipient}</p>
              <p className="text-sm text-gray-500">From: {message.sender}</p>
            </div>

            <div className="border-t border-b border-gray-200 py-6">
              <p className="text-sm text-gray-500 italic">
                Seseorang mengirimkan lagu dan pesan untukmu, mungkin ini adalah lagu yang akan kamu sukai :)
              </p>
              <p className="font-['Reenie_Beanie'] leading-relaxed text-4xl">{message.message}</p>
              
              {message.gif_url && !imageError && (
                <div className="w-[240px] h-[240px] mx-auto my-6 relative">
                  <Image
                    src={message.gif_url}
                    alt="Gift from sender"
                    fill
                    className="rounded-lg object-cover"
                    onError={() => setImageError(true)}
                    sizes="240px"
                  />
                </div>
              )}

              {message.spotify_id && <SpotifyEmbed trackId={message.spotify_id} />}
            </div>

            <div className="mt-6 flex justify-between items-center">
              <ShareMenu message={message.message} id={id} onShare={handleShare} />
              <div className="text-right">
                <p className="text-sm text-gray-500">Sent on: {formattedDate}</p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}