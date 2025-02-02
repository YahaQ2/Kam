/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Navbar } from "@/components/ui/navbar";
import { Footer } from "@/components/ui/footer";
import { SuccessModal } from "@/components/success-modal";

interface SpotifyTrack {
  id: string;
  name: string;
  artist: string;
  album: string;
  cover_url: string;
}

// Ganti dengan API key Giphy Anda
const GIPHY_API_KEY = "YOUR_GIPHY_API_KEY";

export default function MulaiBerceritaPage() {
  // State untuk form
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [message, setMessage] = useState("");
  const [song, setSong] = useState("");
  const [spotifyId, setSpotifyId] = useState("");
  const [tracks, setTracks] = useState<SpotifyTrack[]>([]);
  const [selectedTrack, setSelectedTrack] = useState<SpotifyTrack | null>(null);
  
  // State untuk GIF
  const [gifQuery, setGifQuery] = useState("");
  const [gifs, setGifs] = useState<any[]>([]);
  const [selectedGif, setSelectedGif] = useState<string | null>(null);
  
  // State loading
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingGifs, setIsLoadingGifs] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  // Efek pencarian lagu
  useEffect(() => {
    if (selectedTrack) return;

    const searchSongs = async () => {
      if (song.length < 3) {
        setTracks([]);
        return;
      }

      setIsSearching(true);
      try {
        const response = await fetch(
          `https://unand.vercel.app/v1/api/search-spotify-song?song=${encodeURIComponent(song)}`
        );
        const result = await response.json();

        if (result.success) {
          setTracks(result.data);
        }
      } catch (error) {
        console.error("Error searching songs:", error);
      } finally {
        setIsSearching(false);
      }
    };

    const timeoutId = setTimeout(searchSongs, 500);
    return () => clearTimeout(timeoutId);
  }, [song, selectedTrack]);

  // Efek pencarian GIF
  useEffect(() => {
    if (!gifQuery) {
      setGifs([]);
      return;
    }

    const searchGifs = async () => {
      setIsLoadingGifs(true);
      try {
        const response = await fetch(
          `https://api.giphy.com/v1/gifs/search?api_key=${GIPHY_API_KEY}&q=${encodeURIComponent(gifQuery)}&limit=8`
        );
        const data = await response.json();
        setGifs(data.data);
      } catch (error) {
        console.error("Error searching GIFs:", error);
      } finally {
        setIsLoadingGifs(false);
      }
    };

    const timeoutId = setTimeout(searchGifs, 500);
    return () => clearTimeout(timeoutId);
  }, [gifQuery]);

  const handleSelectTrack = (track: SpotifyTrack) => {
    setSpotifyId(track.id);
    setSong(track.name);
    setSelectedTrack(track);
    setTracks([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
  
    try {
      const response = await fetch("https://unand.vercel.app/v1/api/menfess-spotify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sender: from,
          recipient: to,
          message: message,
          spotify_id: spotifyId,
          gif_url: selectedGif
        }),
      });

      if (!response.ok) throw new Error("Failed to submit form");

      setIsSuccessModalOpen(true);
      resetForm();
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFrom("");
    setTo("");
    setMessage("");
    setSong("");
    setSpotifyId("");
    setSelectedTrack(null);
    setGifQuery("");
    setSelectedGif(null);
  };

  return (
    <div className="min-h-screen bg-white text-gray-800 flex flex-col">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-32">
        <h1 className="text-4xl font-bold mb-8 text-center">Kirim Menfess</h1>
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
          {/* From dan To */}
          <div className="mb-6 md:flex md:space-x-4">
            <div className="md:w-1/2 mb-4 md:mb-0">
              <Label htmlFor="from" className="block text-sm font-medium mb-1">
                From
              </Label>
              <Input
                id="from"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                placeholder="Nama atau alias kamu"
                disabled={isLoading}
              />
            </div>
            <div className="md:w-1/2">
              <Label htmlFor="to" className="block text-sm font-medium mb-1">
                To
              </Label>
              <Input
                id="to"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                placeholder="Nama penerima"
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Pesan */}
          <div className="mb-6">
            <Label htmlFor="message" className="block text-sm font-medium mb-1">
              Message
            </Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="h-40"
              placeholder="Tulis pesanmu..."
              disabled={isLoading}
            />
          </div>

          {/* Pencarian Lagu */}
          <div className="mb-6 relative">
            <Label htmlFor="song" className="block text-sm font-medium mb-1">
              Cari Lagu
            </Label>
            <div className="flex items-center">
              <Input
                id="song"
                value={song}
                onChange={(e) => setSong(e.target.value)}
                placeholder="Cari judul lagu..."
                disabled={isLoading || isSearching || !!selectedTrack}
              />
              {selectedTrack && (
                <Button
                  onClick={() => {
                    setSelectedTrack(null);
                    setSpotifyId("");
                  }}
                  className="ml-2"
                >
                  ✕
                </Button>
              )}
            </div>
            
            {tracks.length > 0 && !selectedTrack && (
              <div className="absolute z-10 w-full bg-white border rounded-md shadow-lg mt-1">
                {tracks.map((track) => (
                  <div
                    key={track.id}
                    onClick={() => handleSelectTrack(track)}
                    className="flex items-center p-2 hover:bg-gray-100 cursor-pointer"
                  >
                    <img
                      src={track.cover_url}
                      alt={track.name}
                      className="w-12 h-12 mr-4 object-cover"
                    />
                    <div>
                      <div className="font-medium">{track.name}</div>
                      <div className="text-sm text-gray-500">{track.artist}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {selectedTrack && (
              <div className="mt-4 flex items-center">
                <img
                  src={selectedTrack.cover_url}
                  alt={selectedTrack.name}
                  className="w-12 h-12 mr-4 object-cover"
                />
                <div>
                  <div className="font-medium">{selectedTrack.name}</div>
                  <div className="text-sm text-gray-500">{selectedTrack.artist}</div>
                </div>
              </div>
            )}
          </div>

          {/* Pencarian GIF */}
          <div className="mb-6 relative">
            <Label htmlFor="gif" className="block text-sm font-medium mb-1">
              Cari GIF
            </Label>
            <div className="flex items-center">
              <Input
                id="gif"
                value={gifQuery}
                onChange={(e) => setGifQuery(e.target.value)}
                placeholder="Cari GIF..."
                disabled={isLoading || isLoadingGifs || !!selectedGif}
              />
              {selectedGif && (
                <Button
                  onClick={() => setSelectedGif(null)}
                  className="ml-2"
                >
                  ✕
                </Button>
              )}
            </div>

            {gifs.length > 0 && !selectedGif && (
              <div className="absolute z-10 w-full bg-white border rounded-md shadow-lg mt-1 grid grid-cols-4 gap-1 p-1">
                {gifs.map((gif) => (
                  <img
                    key={gif.id}
                    src={gif.images.fixed_height.url}
                    alt={gif.title}
                    className="w-full h-24 object-cover cursor-pointer hover:opacity-80"
                    onClick={() => setSelectedGif(gif.images.original.url)}
                  />
                ))}
              </div>
            )}

            {selectedGif && (
              <div className="mt-4">
                <img
                  src={selectedGif}
                  alt="GIF terpilih"
                  className="max-h-40 object-cover rounded-md"
                />
              </div>
            )}
          </div>

          {/* Tombol Submit */}
          <div className="text-center">
            <Button
              type="submit"
              className="bg-gray-800 text-white px-8 py-3 rounded-full hover:bg-gray-900"
              disabled={isLoading}
            >
              {isLoading ? "Mengirim..." : "Kirim Menfess"}
            </Button>
          </div>
        </form>
      </main>
      <Footer />
      <SuccessModal 
        isOpen={isSuccessModalOpen} 
        onClose={() => setIsSuccessModalOpen(false)} 
      />
    </div>
  );
}