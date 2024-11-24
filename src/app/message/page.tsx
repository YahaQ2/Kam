"use client"

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Navbar } from "@/components/ui/navbar"
import { Footer } from "@/components/ui/footer"

export default function MulaiBerceritaPage() {
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [message, setMessage] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission here
    console.log({ from, to, message })
  }

  return (
    <div className="min-h-screen bg-white text-gray-800 flex flex-col">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-32">
        <h1 className="text-4xl font-bold mb-8 text-center">Mulai Bercerita</h1>
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
          <div className="mb-6 md:flex md:space-x-4">
            <div className="md:w-1/2 mb-4 md:mb-0">
              <Label htmlFor="from" className="block text-sm font-medium text-gray-700 mb-1">
                From
              </Label>
              <Input
                id="from"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                className="w-full"
                placeholder="Your name or alias"
              />
            </div>
            <div className="md:w-1/2">
              <Label htmlFor="to" className="block text-sm font-medium text-gray-700 mb-1">
                To
              </Label>
              <Input
                id="to"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className="w-full"
                placeholder="Recipient's name"
              />
            </div>
          </div>
          <div className="mb-6">
            <Label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
              Message
            </Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full h-40"
              placeholder="Share your story..."
            />
          </div>
          <div className="text-center">
            <Button type="submit" className="bg-gray-800 text-white px-8 py-3 rounded-full hover:bg-gray-900 transition-colors">
              Submit
            </Button>
          </div>
        </form>
      </main>
      <Footer />
    </div>
  )
}