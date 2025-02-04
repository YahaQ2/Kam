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

export default function MulaiBerceritaPage() {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [message, setMessage] = useState("");
  const [song, setSong] = useState("");
  const [gifUrl, setGifUrl] = useState("");
  const [spotifyId, setSpotifyId] = useState("");
  const [tracks, setTracks] = useState<SpotifyTrack[]>([]);
  const [selectedTrack, setSelectedTrack] = useState<SpotifyTrack | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

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

  const handleSelectTrack = (track: SpotifyTrack) => {
    setSpotifyId(track.id);
    setSong(track.name);
    setSelectedTrack(track);
    setTracks([]);
    console.log("Selected Spotify ID:", track.id);
  };

  const handleClearSelection = () => {
    setSpotifyId("");
    setSong("");
    setSelectedTrack(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
  
    console.log("Data yang dikirim:", {
      sender: from,
      recipient: to,
      message: message,
      spotify_id: spotifyId,
      gif_url: gifUrl,
    });
  
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
          gif_url: gifUrl,
        }),
      });

      if (!response.ok) {
        throw new Error("Gagal mengirim formulir");
      }

      setIsSuccessModalOpen(true);
      setFrom("");
      setTo("");
      setMessage("");
      setSong("");
      setGifUrl("");
      setSpotifyId("");
      setSelectedTrack(null);
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-white text-gray-800 flex flex-col">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-32">
        <h1 className="text-4xl font-bold mb-8 text-center">Kirim Menfess</h1>
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
          <div className="mb-6 md:flex md:space-x-4">
            <div className="md:w-1/2 mb-4 md:mb-0">
              <Label htmlFor="from" className="block text-sm font-medium text-gray-700 mb-1">
                Dari
              </Label>
              <Input
                id="from"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                className="w-full"
                placeholder="Nama atau alias kamu"
                disabled={isLoading}
              />
            </div>
            <div className="md:w-1/2">
              <Label htmlFor="to" className="block text-sm font-medium text-gray-700 mb-1">
                Untuk
              </Label>
              <Input
                id="to"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className="w-full"
                placeholder="Nama penerima"
                disabled={isLoading}
              />
            </div>
          </div>
          
          <div className="mb-6">
            <Label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
              Pesan
            </Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full h-40"
              placeholder="Tulis pesanmu disini..."
              disabled={isLoading}
            />
          </div>
    <Button
              asChild
              className="bg-gray-800 text-white px-6 md:px-8 py-2.5 md:py-3 rounded-full hover:bg-gray-900 transition-colors"
            >
              <Link href="https://gifunand.vercel.app">cari gif</Link>
            </Button>
          <div className="mb-6">
            <Label htmlFor="gif" className="block text-sm font-medium text-gray-700 mb-1">
              Tambahkan GIF (opsional)
            </Label>
            <div className="flex items-center">
              <Input
                id="gif"
                value={gifUrl}
                onChange={(e) => setGifUrl(e.target.value)}
                className="w-full"
                placeholder="Tempelkan link GIF disini...(gif hanya tersedia di webini"
                disabled={isLoading}
              />
              {gifUrl && (
                <Button 
                  onClick={() => setGifUrl("")} 
                  className="ml-2"
                  variant="ghost"
                >
                  ✕
                </Button>
              )}
            </div>
            {gifUrl && (
              <div className="mt-4">
                <img
                  src={gifUrl}
                  alt="Preview GIF"
                  className="max-w-xs rounded-md border border-gray-200"
                />
              </div>
            )}
          </div>

          <div className="mb-6 relative">
            <Label htmlFor="song" className="block text-sm font-medium text-gray-700 mb-1">
              Cari Lagu
            </Label>
            <div className="flex items-center">
              <Input
                id="song"
                value={song}
                onChange={(e) => setSong(e.target.value)}
                className="w-full"
                placeholder="Ketik judul lagu..."
                disabled={isLoading || isSearching || !!selectedTrack}
              />
              {selectedTrack && (
                <Button onClick={handleClearSelection} className="ml-2">
                  ✕
                </Button>
              )}
            </div>
            {tracks.length > 0 && !selectedTrack && (
              <div className="absolute z-10 w-full bg-white border rounded-md shadow-lg mt-1 max-h-80 overflow-y-auto">
                {tracks.map((track) => (
                  <div
                    key={track.id}
                    onClick={() => handleSelectTrack(track)}
                    className="flex items-center p-2 hover:bg-gray-100 cursor-pointer"
                  >
                    <img
                      src={track.cover_url}
                      alt={track.name}
                      className="w-12 h-12 mr-4 object-cover rounded"
                    />
                    <div>
                      <div className="font-medium line-clamp-1">{track.name}</div>
                      <div className="text-sm text-gray-500 line-clamp-1">{track.artist}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {selectedTrack && (
              <div className="mt-4 flex items-center">
                {selectedTrack.cover_url && (
                  <img
                    src={selectedTrack.cover_url}
                    alt={selectedTrack.name}
                    className="w-12 h-12 mr-4 object-cover rounded"
                  />
                )}
                <div>
                  <div className="font-medium line-clamp-1">{selectedTrack.name}</div>
                  <div className="text-sm text-gray-500 line-clamp-1">{selectedTrack.artist}</div>
                </div>
              </div>
            )}
          </div>

          <div className="text-center">
            <Button
              type="submit"
              className="bg-gray-800 text-white px-8 py-3 rounded-full hover:bg-gray-900 transition-colors text-lg"
              disabled={isLoading}
            >
              {isLoading ? "Mengirim..." : "Kirim Sekarang"}
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