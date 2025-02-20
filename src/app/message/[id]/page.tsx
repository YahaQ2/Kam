"use client"

import { useRouter, useParams } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Navbar } from "@/components/ui/navbar"
import { Footer } from "@/components/ui/footer"
import { useEffect, useState, useRef } from "react"
import dayjs from "dayjs"
import utc from "dayjs/plugin/utc"
import timezone from "dayjs/plugin/timezone"
import { Loader2, Download, Copy } from "lucide-react"
import {
  FacebookShareButton,
  TwitterShareButton,
  WhatsappShareButton,
  FacebookIcon,
  TwitterIcon,
  WhatsappIcon,
} from "react-share"
import { FaInstagram } from "react-icons/fa"
import html2canvas from "html2canvas"

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

export default function MessagePage() {
  const router = useRouter()
  const { id } = useParams()
  const [message, setMessage] = useState<MessageType | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [imageError, setImageError] = useState(false)
  const [isCopied, setIsCopied] = useState(false)
  const [isImageGenerated, setIsImageGenerated] = useState(false)
  const [shareImageUrl, setShareImageUrl] = useState<string | null>(null)
  const messageCardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const fetchMessage = async () => {
      setIsLoading(true)
      try {
        const response = await fetch(`https://unand.vercel.app/v1/api/menfess-spotify-search/${id}`)

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = await response.json()

        if (!data?.status || !data?.data?.[0]) {
          throw new Error("Invalid data format")
        }

        const messageData = data.data[0]
        setMessage(messageData)

        // Update meta tags for social sharing
        if (typeof window !== "undefined") {
          const metaTags = [
            { property: "og:title", content: `Pesan untuk ${messageData.recipient}` },
            { property: "og:description", content: messageData.message },
            { property: "og:image", content: messageData.gif_url },
            { property: "og:url", content: window.location.href },
            { name: "twitter:card", content: "summary_large_image" },
          ]

          metaTags.forEach((tag) => {
            const element =
              document.querySelector(`meta[property="${tag.property}"]`) ||
              document.querySelector(`meta[name="${tag.property}"]`)
            if (element) {
              element.setAttribute("content", tag.content)
            }
          })
        }
      } catch (error) {
        console.error("Error fetching message:", error)
        setMessage(null)
      } finally {
        setIsLoading(false)
      }
    }

    fetchMessage()
  }, [id])

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href)
    setIsCopied(true)
    setTimeout(() => setIsCopied(false), 2000)
  }

  const generateShareImage = async () => {
    if (!messageCardRef.current) return

    setIsLoading(true)
    try {
      // First, create a clone of the message card to modify for the image
      const cardClone = messageCardRef.current.cloneNode(true) as HTMLDivElement

      // Add styles specifically for the image version
      cardClone.style.width = "600px"
      cardClone.style.padding = "40px"
      cardClone.style.backgroundColor = "#ffffff"
      cardClone.style.borderRadius = "16px"
      cardClone.style.boxShadow = "0 10px 25px rgba(0, 0, 0, 0.1)"

      // Add a watermark/branding to the clone
      const brandingDiv = document.createElement("div")
      brandingDiv.style.textAlign = "center"
      brandingDiv.style.marginTop = "20px"
      brandingDiv.style.padding = "10px"
      brandingDiv.style.fontFamily = "Arial, sans-serif"
      brandingDiv.style.fontSize = "14px"
      brandingDiv.style.color = "#888"
      brandingDiv.textContent = "Dibagikan melalui unand.vercel.app"
      cardClone.appendChild(brandingDiv)

      // Append clone to body temporarily (needed for html2canvas), but hide it
      cardClone.style.position = "absolute"
      cardClone.style.left = "-9999px"
      document.body.appendChild(cardClone)

      // Use html2canvas to create an image
      const canvas = await html2canvas(cardClone, {
        scale: 2, // Higher resolution
        useCORS: true, // Enable cross-origin image loading
        backgroundColor: "#ffffff",
        logging: false,
      })

      // Remove the clone from the document
      document.body.removeChild(cardClone)

      // Convert canvas to data URL
      const dataUrl = canvas.toDataURL("image/png")
      setShareImageUrl(dataUrl)
      setIsImageGenerated(true)
    } catch (error) {
      console.error("Error generating image:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const downloadShareImage = () => {
    if (!shareImageUrl) return

    const a = document.createElement("a")
    a.href = shareImageUrl
    a.download = `pesan-untuk-${message?.recipient.replace(/\s+/g, "-")}.png`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  const shareToInstagram = () => {
    if (!shareImageUrl) {
      generateShareImage()
      return
    }

    // For mobile devices
    if (/Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
      downloadShareImage()
      alert("Gambar telah diunduh. Silakan bagikan ke Instagram secara manual.")
    } else {
      downloadShareImage()
      alert("Gambar telah diunduh. Silakan bagikan ke Instagram secara manual.")
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
        <p className="text-xl font-semibold text-gray-600">Pesan tidak ditemukan</p>
      </div>
    )
  }

  const formattedDate = dayjs.utc(message.created_at).tz("Asia/Jakarta").format("DD MMM YYYY, HH:mm")

  const shareUrl = typeof window !== "undefined" ? window.location.href : ""
  const shareText = `Lihat pesan ini: ${message.message}`

  return (
    <div className="min-h-screen bg-white text-gray-800 flex flex-col">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-32">
        <Button onClick={() => router.back()} className="mb-8 bg-gray-800 text-white hover:bg-gray-900">
          Kembali
        </Button>

        {/* Message Card - This is what gets captured for sharing */}
        <div ref={messageCardRef} className="max-w-2xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="p-8">
            <div className="mb-6">
              <p className="text-sm text-gray-500">Untuk: {message.recipient}</p>
              <p className="text-sm text-gray-500">Dari: {message.sender}</p>
            </div>
            <div className="border-t border-b border-gray-200 py-6">
              <p className="text-sm text-gray-500 italic">
                Seseorang mengirimkan lagu dan pesan untukmu, mungkin ini adalah lagu yang akan kamu sukai :)
              </p>
              <p className="font-['Reenie_Beanie'] leading-relaxed text-4xl">{message.message}</p>
              {message.gif_url && !imageError && (
                <div className="w-[240px] h-[240px] mx-auto my-6 relative">
                  <Image
                    src={message.gif_url || "/placeholder.svg"}
                    alt="Hadiah dari pengirim"
                    fill
                    className="rounded-lg object-cover"
                    onError={() => setImageError(true)}
                    unoptimized
                    sizes="240px"
                  />
                </div>
              )}
              {message.spotify_id && <SpotifyEmbed trackId={message.spotify_id} />}
            </div>
            <div className="mt-4 text-right">
              <p className="text-sm text-gray-500">Dikirim pada: {formattedDate}</p>
            </div>
          </div>
        </div>

        {/* Sharing Options */}
        <div className="max-w-2xl mx-auto mt-8">
          <h3 className="text-lg font-medium mb-4">Bagikan Pesan</h3>

          <div className="grid grid-cols-2 gap-4">
            {/* Regular Social Sharing */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium mb-3">Bagikan Link</h4>
              <div className="flex space-x-3 mb-3">
                <FacebookShareButton url={shareUrl} quote={shareText}>
                  <FacebookIcon size={40} round />
                </FacebookShareButton>
                <TwitterShareButton url={shareUrl} title={shareText}>
                  <TwitterIcon size={40} round />
                </TwitterShareButton>
                <WhatsappShareButton url={shareUrl} title={shareText}>
                  <WhatsappIcon size={40} round />
                </WhatsappShareButton>
                <Button onClick={handleCopyLink} variant="outline" size="icon">
                  <Copy className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Instagram Image Sharing */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium mb-3">Bagikan ke Instagram</h4>
              <div className="flex flex-col space-y-3">
                {!isImageGenerated ? (
                  <Button
                    onClick={generateShareImage}
                    className="bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <FaInstagram className="mr-2 h-4 w-4" />
                    )}
                    Buat Gambar untuk Instagram
                  </Button>
                ) : (
                  <div className="flex flex-col space-y-3">
                    <div className="border rounded-lg p-2 bg-white">
                      <img src={shareImageUrl || ""} alt="Preview" className="w-full h-auto rounded" />
                    </div>
                    <div className="flex space-x-2">
                      <Button onClick={downloadShareImage} variant="outline" className="flex-1">
                        <Download className="mr-2 h-4 w-4" />
                        Unduh Gambar
                      </Button>
                      <Button
                        onClick={shareToInstagram}
                        className="flex-1 bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600"
                      >
                        <FaInstagram className="mr-2 h-4 w-4" />
                        Bagikan ke Instagram
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {isCopied && (
          <div className="fixed bottom-4 right-4 bg-green-100 text-green-800 px-4 py-2 rounded-md shadow-md">
            Link berhasil disalin! 🎉
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}

