"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Navbar } from "@/components/ui/navbar"
import { Footer } from "@/components/ui/footer"
import { useEffect, useState, useRef } from "react"
import dayjs from "dayjs"
import utc from "dayjs/plugin/utc"
import timezone from "dayjs/plugin/timezone"
import { Loader2, Twitter, Facebook, Link2, MessageCircle, Instagram, Share2, Play, Pause, Volume2 } from "lucide-react"

dayjs.extend(utc)
dayjs.extend(timezone)

type MessageType = {
  id: number
  sender: string
  recipient: string
  message: string
  gif_url: string
  spotify_id?: string
  voice_note_url?: string
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
  const loveWordsRegex = /love|cinta|sayang|crush/i
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
        <div className="absolute right-0 mt-2 bg-white rounded-lg shadow-xl p-2 space-y-2 min-w-[200px] z-50 border border-gray-200">
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

const VoiceNotePlayer = ({ url }: { url: string }) => {
  const [isPlaying, setIsPlaying] = useState(false)
  const [duration, setDuration] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const progressRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const audio = new Audio(url)
    audioRef.current = audio
    
    audio.addEventListener('loadedmetadata', () => {
      setDuration(audio.duration)
    })
    
    audio.addEventListener('timeupdate', () => {
      setCurrentTime(audio.currentTime)
    })
    
    audio.addEventListener('ended', () => {
      setIsPlaying(false)
      setCurrentTime(0)
    })
    
    return () => {
      audio.pause()
      audio.src = ''
      audio.removeEventListener('loadedmetadata', () => {})
      audio.removeEventListener('timeupdate', () => {})
      audio.removeEventListener('ended', () => {})
    }
  }, [url])
  
  const togglePlayPause = () => {
    if (!audioRef.current) return
    
    if (isPlaying) {
      audioRef.current.pause()
    } else {
      audioRef.current.play()
    }
    setIsPlaying(!isPlaying)
  }
  
  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current || !progressRef.current) return
    
    const rect = progressRef.current.getBoundingClientRect()
    const pos = (e.clientX - rect.left) / rect.width
    
    audioRef.current.currentTime = pos * duration
    setCurrentTime(pos * duration)
  }
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }
  
  return (
    <div className="my-6 bg-gray-100 rounded-lg p-4">
      <div className="flex items-center mb-3">
        <Volume2 className="w-5 h-5 mr-2 text-gray-600" />
        <span className="text-sm font-medium text-gray-700">Voice Message</span>
      </div>
      
      <div className="flex items-center space-x-3">
        <Button 
          onClick={togglePlayPause} 
          size="sm"
          variant="ghost" 
          className="rounded-full w-10 h-10 p-0 flex items-center justify-center bg-gray-200 hover:bg-gray-300 text-gray-800"
        >
          {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
        </Button>
        
        <div className="flex-1 flex items-center space-x-2">
          <span className="text-xs text-gray-500 w-8">{formatTime(currentTime)}</span>
          <div 
            ref={progressRef}
            className="flex-1 h-2 bg-gray-300 rounded-full cursor-pointer relative"
            onClick={handleProgressClick}
          >
            <div 
              className="absolute top-0 left-0 h-full bg-gray-600 rounded-full"
              style={{ width: `${(currentTime / duration) * 100}%` }}
            ></div>
          </div>
          <span className="text-xs text-gray-500 w-8">{formatTime(duration)}</span>
        </div>
      </div>
    </div>
  )
}

export default function MessageClient({ params }: { params: { id: string } }) {
  const router = useRouter()