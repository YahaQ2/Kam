'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Navbar } from "@/components/ui/navbar"
import { Footer } from "@/components/ui/footer"
import { CarouselCard } from "@/components/carousel-card"
import { ScrollToTopButton } from "@/components/scroll-to-top-button"
import Link from 'next/link'
import { ArrowUpRight, ArrowLeft, ArrowRight } from 'lucide-react'
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { CalendarIcon } from 'lucide-react'
import debounce from 'lodash/debounce'

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
  const [searchTerm, setSearchTerm] = useState('')
  const [searchResults, setSearchResults] = useState<Menfess[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [searchBy, setSearchBy] = useState<'recipient' | 'sender'>('recipient')
  const [date, setDate] = useState<Date | undefined>(undefined)
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest')
  const [isCalendarOpen, setIsCalendarOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const limit = 10

  const fetchMessages = useCallback(async (page: number) => {
    setIsLoading(true)
    
    const params = new URLSearchParams()
    if (searchTerm) params.append(searchBy, searchTerm)
    if (date) params.append('date', format(date, 'yyyy-MM-dd'))
    params.append('sort', sortOrder === 'newest' ? 'desc' : 'asc')
    params.append('page', page.toString())
    params.append('limit', limit.toString())

    try {
      const response = await fetch(
        `https://unand.vercel.app/v1/api/menfess-spotify-search?${params.toString()}`
      )

      if (!response.ok) throw new Error('Error fetching messages')

      const result = await response.json()
      const data: Menfess[] = result.data || []
      
      setTotalPages(result.totalPages || 1)
      setTotalItems(result.totalItems || 0)
      setCurrentPage(page)

      const sortedMessages = data.map(menfess => ({
        ...menfess,
        song: menfess.track ? {
          title: menfess.track.title,
          artist: menfess.track.artist,
          coverUrl: menfess.track.cover_img
        } : undefined
      }))

      setSearchResults(sortedMessages)
    } catch (error) {
      console.error('Error searching messages:', error)
      setSearchResults([])
    } finally {
      setIsLoading(false)
    }
  }, [searchTerm, searchBy, date, sortOrder])

  const debouncedSearch = useCallback(
    debounce(() => {
      fetchMessages(1)
    }, 500),
    [fetchMessages]
  )

  useEffect(() => {
    debouncedSearch()
    return () => debouncedSearch.cancel()
  }, [debouncedSearch])

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return
    fetchMessages(newPage)
  }

  const Pagination = () => (
    <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-between w-full">
      <div className="text-sm text-gray-600">
        Halaman {currentPage} dari {totalPages} ({totalItems} menfess)
      </div>
      
      <div className="flex gap-2">
        <Button
          variant="default"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="gap-1"
        >
          <ArrowLeft className="h-4 w-4" />
          Sebelumnya
        </Button>
        
        <Button
          variant="default"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="gap-1"
        >
          Selanjutnya
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-white text-gray-800 flex flex-col">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8 sm:py-12 md:py-16 max-w-6xl">
        <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-center">Cari Menfess</h1>
        <div className="flex justify-center mb-4 sm:mb-6">
          <Link
            href="https://www.instagram.com/stories/thepdfway/3511672612546304368?utm_source=ig_story_item_share&igsh=dHZ6MWtpdDV5MTVw"
            className="inline-flex items-center justify-center px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors border border-gray-300 rounded-full hover:border-gray-400"
          >
            <span>saran/masukan/fitur baru</span>
            <ArrowUpRight className="ml-2 h-4 w-4" />
          </Link>
        </div>
        <div className="max-w-3xl mx-auto mb-6">
          <div className="flex flex-col space-y-4">
            <div className="relative">
              <Input
                id="searchTerm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pr-12"
                placeholder={`Cari berdasarkan ${searchBy === 'sender' ? 'pengirim' : 'penerima'}`}
                disabled={isLoading}
              />
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center">
                <Switch
                  id="search-by"
                  checked={searchBy === 'sender'}
                  onCheckedChange={(checked) => setSearchBy(checked ? 'sender' : 'recipient')}
                  aria-label={`Ubah pencarian ke ${searchBy === 'sender' ? 'penerima' : 'pengirim'}`}
                />
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
              <div className="flex w-full sm:w-auto space-x-2">
                <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "flex-grow sm:flex-grow-0 sm:w-[140px] justify-start text-left font-normal",
                        !date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? (
                        <span className="truncate">
                          {format(date, "dd MMM yyyy")}
                        </span>
                      ) : (
                        <span>Pilih tanggal</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={(newDate) => {
                        setDate(newDate)
                        setIsCalendarOpen(false)
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <Button
                  onClick={() => setDate(undefined)}
                  variant="outline"
                  className="flex-shrink-0"
                >
                  Reset
                </Button>
              </div>
              <Select 
                value={sortOrder} 
                onValueChange={(value: 'newest' | 'oldest') => setSortOrder(value)}
              >
                <SelectTrigger className="w-full sm:w-[120px]">
                  <SelectValue placeholder="Urutkan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Terbaru</SelectItem>
                  <SelectItem value="oldest">Terlama</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        {isLoading ? (
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            <p className="mt-2">Memuat...</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 justify-items-center">
              {searchResults.length > 0 ? (
                searchResults.map((msg) => (
                  <Link 
                    href={`/message/${msg.id}`} 
                    key={msg.id} 
                    className="w-full max-w-xs flex justify-center"
                  >
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
                <div className="col-span-full text-center text-gray-500">
                  {totalItems === 0 
                    ? "Belum ada menfess yang tersedia" 
                    : "Yahh menfess yang kamu cari gaada, jangan terlalu berharap yah!! nanti sakit :("}
                </div>
              )}
            </div>
            
            {searchResults.length > 0 && (
              <Pagination />
            )}
          </>
        )}
      </main>
      <Footer />
      <ScrollToTopButton />
    </div>
  )
}