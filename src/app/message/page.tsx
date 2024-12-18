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
  external_url: string;
}

export default function MulaiBerceritaPage() {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [message, setMessage] = useState("");
  const [song, setSong] = useState("");
  const [spotifyId, setSpotifyId] = useState("");
  const [tracks, setTracks] = useState<SpotifyTrack[]>([]);
  const [selectedTrack, setSelectedTrack] = useState<SpotifyTrack | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    // Load reCAPTCHA script
    const script = document.createElement("script");
    
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

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
  };

  const handleClearSelection = () => {
    setSpotifyId("");
    setSong("");
    setSelectedTrack(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");

    // Validasi input
    if (!from.trim()) {
      setErrorMessage("Nama pengirim tidak boleh kosong");
      setIsLoading(false);
      return;
    }
    if (!to.trim()) {
      setErrorMessage("Nama penerima tidak boleh kosong");
      setIsLoading(false);
      return;
    }
    if (!message.trim()) {
      setErrorMessage("Pesan tidak boleh kosong");
      setIsLoading(false);
      return;
    }
    if (!spotifyId) {
      setErrorMessage("Harap pilih lagu terlebih dahulu");
      setIsLoading(false);
      return;
    }

    try {
      // Generate reCAPTCHA token
      const recaptchaSiteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

        if (!recaptchaSiteKey) {
          throw new Error("reCAPTCHA site key is not defined.");
        }

        const recaptchaToken = await new Promise<string>((resolve, reject) => {
          window.grecaptcha
            .execute(recaptchaSiteKey, { action: "submit_menfess" })
            .then(resolve)
            .catch(reject);
        });

        console.log(recaptchaToken);
        console.log("reCAPTCHA Token:", recaptchaToken);

        const submissionData = {
          sender: from,
          recipient: to,
          message: message,
          spotify_id: spotifyId,
          track_metadata: {
            name: selectedTrack?.name,
            artist: selectedTrack?.artist,
            album: selectedTrack?.album,
            cover_url: selectedTrack?.cover_url,
            external_url: selectedTrack?.external_url
          },
          recaptcha_token: recaptchaToken
        };
        
        const response = await fetch("https://unand.vercel.app/v1/api/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(submissionData),
        });

      const result = await response.json();

      if (result.success) {
        setIsSuccessModalOpen(true);
        // Reset form fields
        setFrom("");
        setTo("");
        setMessage("");
        setSong("");
        setSpotifyId("");
        setSelectedTrack(null);
      } else {
        // Handle submission error
        setErrorMessage(result.message || "Gagal mengirim menfess");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      setErrorMessage("Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-gray-800 flex flex-col">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-32">
        <h1 className="text-4xl font-bold mb-8 text-center">Kirim Menfess</h1>

        {errorMessage && (
          <div className="max-w-4xl mx-auto mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <span className="block sm:inline">{errorMessage}</span>
          </div>
        )}

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
                disabled={isLoading}
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
                disabled={isLoading}
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
              disabled={isLoading}
            />
          </div>
          <div className="mb-6 relative">
            <Label htmlFor="song" className="block text-sm font-medium text-gray-700 mb-1">
              Search Song
            </Label>
            <div className="flex items-center">
              <Input
                id="song"
                value={song}
                onChange={(e) => setSong(e.target.value)}
                className="w-full"
                placeholder="Type song title..."
                disabled={isLoading || isSearching || !!selectedTrack}
              />
              {selectedTrack && (
                <Button type="button" onClick={handleClearSelection} className="ml-2">
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

            {/* Display selected song details */}
            {selectedTrack && (
              <div className="mt-4 flex items-center">
                {selectedTrack.cover_url && (
                  <img
                    src={selectedTrack.cover_url}
                    alt={selectedTrack.name}
                    className="w-12 h-12 mr-4 object-cover"
                  />
                )}
                <div>
                  <div className="font-medium">{selectedTrack.name}</div>
                  <div className="text-sm text-gray-500">{selectedTrack.artist}</div>
                </div>
              </div>
            )}
          </div>
          <div className="text-center">
            <Button
              type="submit"
              className="bg-gray-800 text-white px-8 py-3 rounded-full hover:bg-gray-900 transition-colors"
              disabled={isLoading}
            >
              {isLoading ? "Submitting..." : "Submit"}
            </Button>
          </div>
        </form>
      </main>
      <Footer />
      <SuccessModal isOpen={isSuccessModalOpen} onClose={() => setIsSuccessModalOpen(false)} />
    </div>
  );
}