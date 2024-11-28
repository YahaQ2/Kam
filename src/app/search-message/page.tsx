"use client"

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Navbar } from "@/components/ui/navbar"
import { Footer } from "@/components/ui/footer"
import { CarouselCard } from "@/components/carousel-card"
import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'

type Message = {
  id: number;
  sender: string;
  recipient: string;
  message: string;
  created_at: string;
}

export default function SearchMessagesPage() {
  const [sender, setSender] = useState('')
  const [recipient, setRecipient] = useState('')
  const [searchResults, setSearchResults] = useState<Message[] | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    const params = new URLSearchParams()
    if (sender) params.append('sender', sender)
    if (recipient) params.append('recipient', recipient)

    try {
      const response = await fetch(`https://solifess.vercel.app/v1/api/menfess?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error('Error fetching messages')
      }

      const result = await response.json()
      const data: Message[] = result.data

      setSearchResults(data)
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
            href="https://www.instagram.com/stories/thepdfway/3511672612546304368?utm_source=ig_story_item_share&igsh=dHZ6MWtpdDV5MTVw"
            className="inline-flex items-center justify-center px-4 py-2 text-sm md:text-base font-medium text-gray-600 hover:text-gray-800 transition-colors border border-gray-300 rounded-full hover:border-gray-400"
          >
            <span>saran/masukan/fitur baru</span>
            <ArrowUpRight className="ml-2 h-4 w-4 md:h-5 md:w-5" />
          </Link>
        </div>
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto mb-8">
          <div className="mb-6 md:flex md:space-x-4">
            <div className="md:w-1/2 mb-4 md:mb-0">
              <Label htmlFor="sender" className="block text-sm font-medium text-gray-700 mb-1">
                From
              </Label>
              <Input
                id="sender"
                value={sender}
                onChange={(e) => setSender(e.target.value)}
                className="w-full"
                placeholder="Sender's name"
                disabled={isLoading}
              />
            </div>
            <div className="md:w-1/2">
              <Label htmlFor="recipient" className="block text-sm font-medium text-gray-700 mb-1">
                To
              </Label>
              <Input
                id="recipient"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                className="w-full"
                placeholder="Recipient's name"
                disabled={isLoading}
              />
            </div>
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

