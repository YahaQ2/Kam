"use client"

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Navbar } from "@/components/ui/navbar"
import { Footer } from "@/components/ui/footer"
import { CarouselCard } from "@/components/carousel-card"
import Link from 'next/link'

// Mock data for demonstration
const mockMessages = [
  { id: 1, sender: "Alice", recipient: "Bob", message: "Hey Bob, how are you?" },
  { id: 2, sender: "Bob", recipient: "Alice", message: "Hi Alice, I'm good! How about you?" },
  { id: 3, sender: "Charlie", recipient: "David", message: "David, don't forget our meeting tomorrow." },
  { id: 4, sender: "David", recipient: "Charlie", message: "Thanks for the reminder, Charlie!" },
]

export default function SearchMessagesPage() {
  const [sender, setSender] = useState('')
  const [recipient, setRecipient] = useState('')
  const [searchResults, setSearchResults] = useState<typeof mockMessages | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulate API call
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      const filteredMessages = mockMessages.filter(msg => 
        msg.sender.toLowerCase().includes(sender.toLowerCase()) &&
        msg.recipient.toLowerCase().includes(recipient.toLowerCase())
      )
      setSearchResults(filteredMessages)
    } catch (error) {
      console.error('Error searching messages:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white text-gray-800 flex flex-col">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-32">
        <h1 className="text-4xl font-bold mb-8 text-center">Cari Menfess</h1>
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
                  <CarouselCard to={msg.recipient} from={msg.sender} message={msg.message} />
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