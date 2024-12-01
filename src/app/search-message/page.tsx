"use client"

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Navbar } from "@/components/ui/navbar"
import { Footer } from "@/components/ui/footer"
import { CarouselCard } from "@/components/carousel-card"
import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'

interface Menfess {
  id: number;
  sender: string;
  recipient: string;
  message: string;
  spotify_id?: string;
  track?: {
    title: string;
    artist: string;
    cover_img: string;
    preview_link: string | null;
    spotify_embed_link: string;
  };
  song?: {
    title: string;
    artist: string;
    coverUrl: string;
  };
  created_at: string;
  updated_at?: string | null;
}

export default function SearchMessagesPage() {
  const [recipient, setRecipient] = useState('')
  const [searchResults, setSearchResults] = useState<Menfess[] | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    const params = new URLSearchParams()
    if (recipient) params.append('recipient', recipient)

    try {
      const response = await fetch(`https://unand.vercel.app/v1/api/menfess-spotify-search?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error('Error fetching messages')
      }

      const result = await response.json()
      const data: Menfess[] = result.data

      const sortedMessages = data.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .map(menfess => ({
          ...menfess,
          song: menfess.track ? {
            title: menfess.track.title,
            artist: menfess.track.artist,
            coverUrl: menfess.track.cover_img
          } : undefined
        }));

      setSearchResults(sortedMessages)
    } catch (error) {
      console.error('Error searching messages:', error)
      setSearchResults([])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white text-gray-800 flex flex-col">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-32">
        <h1 className="text-4xl font-bold mb-8 text-center">Cari Menfess</h1>
        <div className="flex justify-center mb-8">
          <Link
            href="https://www.instagram.com/fer_.putra"
            className="inline-flex items-center justify-center px-4 py-2 text-sm md:text-base font-medium text-gray-600 hover:text-gray-800 transition-colors border border-gray-300 rounded-full hover:border-gray-400"
          >
            <span>saran/masukan/fitur baru</span> 

            <ArrowUpRight className="ml-2 h-4 w-4 md:h-5 md:w-5" />
                  
          </Link>
          
          

        </div>
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto mb-8">
          <div className="mb-6">
            <Input
              id="recipient"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              className="w-full"
              placeholder="Recipient's name atau isi kosong untuk melihat pesan terbaru"
              disabled={isLoading}
            />
          </div>
          <div className="text-center">
            <Button 
              type="submit" 
              className="bg-gray-800 text-white px-8 py-3 rounded-full hover:bg-gray-900 transition-colors"
              disabled={isLoading}
            >
              {isLoading ? 'Searching...' : 'Search'}
            </Button>
          </div>
        </form>
        {searchResults !== null && (
          <div className="flex flex-wrap justify-center gap-4 mt-8">
            {searchResults.length > 0 ? (
              searchResults.map((msg) => (
                <Link href={`/message/${msg.id}`} key={msg.id} className="block">
                  <CarouselCard 
                    to={msg.recipient} 
                    from={msg.sender} 
                    message={msg.message} 
                    songTitle={msg.song?.title}
                    artist={msg.song?.artist}
                    coverUrl={msg.song?.coverUrl}
                  />
                </Link>
              ))
            ) : (
              <div className="text-center text-gray-500">
                Yahh menfess yang kamu cari gaada :(
              </div>
            )}
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}
