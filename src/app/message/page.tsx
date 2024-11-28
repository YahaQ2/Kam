// app/mulai-bercerita/page.tsx
"use client"

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import dynamic from 'next/dynamic'

// Dynamically import components with SSR disabled
const DynamicNavbar = dynamic(() => import('@/components/ui/navbar').then(mod => mod.Navbar), {
  ssr: false
})

const DynamicFooter = dynamic(() => import('@/components/ui/footer').then(mod => mod.Footer), {
  ssr: false
})

export default function MulaiBerceritaPage() {
  const [mounted, setMounted] = useState(false)
  const [formData, setFormData] = useState({
    from: '',
    to: '',
    message: ''
  })

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log(formData)
  }

  if (!mounted) {
    return null
  }

  return (
    <div className="min-h-screen bg-white text-gray-800 flex flex-col">
      <DynamicNavbar />
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
                name="from"
                value={formData.from}
                onChange={handleChange}
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
                name="to"
                value={formData.to}
                onChange={handleChange}
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
              name="message"
              value={formData.message}
              onChange={handleChange}
              className="w-full h-40"
              placeholder="Share your story..."
            />
          </div>
          <div className="text-center">
            <Button 
              type="submit" 
              className="bg-gray-800 text-white px-8 py-3 rounded-full hover:bg-gray-900 transition-colors"
            >
              Submit
            </Button>
          </div>
        </form>
      </main>
      <DynamicFooter />
    </div>
  )
}