/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
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

interface FormState {
  from: string;
  to: string;
  message: string;
  song: string;
  gifUrl: string;
  spotifyId: string;
  selectedTrack: SpotifyTrack | null;
}

const isValidFormState = (state: unknown): state is FormState => {
  return (
    typeof state === "object" &&
    state !== null &&
    "from" in state &&
    "to" in state &&
    "message" in state &&
    "song" in state &&
    "gifUrl" in state &&
    "spotifyId" in state &&
    "selectedTrack" in state &&
    typeof (state as FormState).from === "string" &&
    typeof (state as FormState).to === "string" &&
    typeof (state as FormState).message === "string" &&
    typeof (state as FormState).song === "string" &&
    typeof (state as FormState).gifUrl === "string" &&
    typeof (state as FormState).spotifyId === "string" &&
    (
      (state as FormState).selectedTrack === null ||
      (
        typeof (state as FormState).selectedTrack === "object" &&
        (state as FormState).selectedTrack !== null &&
        "id" in (state as FormState).selectedTrack! &&
        "name" in (state as FormState).selectedTrack! &&
        "artist" in (state as FormState).selectedTrack! &&
        "album" in (state as FormState).selectedTrack! &&
        "cover_url" in (state as FormState).selectedTrack! &&
        typeof (state as FormState).selectedTrack!.id === "string" &&
        typeof (state as FormState).selectedTrack!.name === "string" &&
        typeof (state as FormState).selectedTrack!.artist === "string" &&
        typeof (state as FormState).selectedTrack!.album === "string" &&
        typeof (state as FormState).selectedTrack!.cover_url === "string"
      )
    )
  );
};

export default function MulaiBerceritaPage() {
  const [formState, setFormState] = useState<FormState>({
    from: "",
    to: "",
    message: "",
    song: "",
    gifUrl: "",
    spotifyId: "",
    selectedTrack: null,
  });

  const [tracks, setTracks] = useState<SpotifyTrack[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const savedState = localStorage.getItem("menfessFormState");
    if (savedState) {
      try {
        const parsedState = JSON.parse(savedState);
        if (isValidFormState(parsedState)) {
          setFormState(parsedState);
        }
      } catch (e) {
        console.error("Failed to parse saved state from localStorage", e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("menfessFormState", JSON.stringify(formState));
  }, [formState]);

  useEffect(() => {
    if (formState.selectedTrack) return;

    const searchSongs = async () => {
      if (formState.song.length < 3) {
        setTracks([]);
        return;
      }

      setIsSearching(true);
      try {
        const response = await fetch(
          `https://unand.vercel.app/v1/api/search-spotify-song?song=${encodeURIComponent(formState.song)}`
        );

        if (!response.ok) throw new Error("Gagal mencari lagu");

        const result = await response.json();

        if (result.success) {
          setTracks(result.data);
        }
      } catch (error) {
        console.error("Error searching songs:", error);
        setError("Gagal memuat daftar lagu. Coba lagi nanti.");
      } finally {
        setIsSearching(false);
      }
    };

    const timeoutId = setTimeout(searchSongs, 500);
    return () => clearTimeout(timeoutId);
  }, [formState.song, formState.selectedTrack]);

  const handleSelectTrack = (track: SpotifyTrack) => {
    setFormState(prev => ({
      ...prev,
      spotifyId: track.id,
      song: track.name,
      selectedTrack: track
    }));
    setTracks([]);
  };

  const handleClearSelection = () => {
    setFormState(prev => ({
      ...prev,
      spotifyId: "",
      song: "",
      selectedTrack: null
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validasi URL GIF
    if (formState.gifUrl && !formState.gifUrl.match(/\.(gif|webp)(\?.*)?$/i)) {
      setError("Harap masukkan URL GIF yang valid (akhiran .gif atau .webp)");
      return;
    }

    if (!formState.from || !formState.to || !formState.message || !formState.spotifyId) {
      setError("Harap isi semua field wajib!");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("https://unand.vercel.app/v1/api/menfess-spotify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sender: formState.from,
          recipient: formState.to,
          message: formState.message,
          spotify_id: formState.spotifyId,
          gif_url: formState.gifUrl, // Key diubah ke camelCase
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Gagal mengirim formulir");
      }

      setIsSuccessModalOpen(true);
      setFormState({
        from: "",
        to: "",
        message: "",
        song: "",
        gifUrl: "",
        spotifyId: "",
        selectedTrack: null,
      });
      localStorage.removeItem("menfessFormState");
    } catch (error) {
      console.error("Error submitting form:", error);
      setError(error instanceof Error ? error.message : "Terjadi kesalahan tidak terduga");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field: keyof FormState, value: string) => {
    setFormState(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="min-h-screen bg-white text-gray-800 flex flex-col">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-32">
        <h1 className="text-4xl font-bold mb-8 text-center">Kirim Menfess</h1>
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
              {error}
            </div>
          )}

          <div className="mb-6 md:flex md:space-x-4">
            <div className="md:w-1/2 mb-4 md:mb-0">
              <Label htmlFor="from">Dari</Label>
              <Input
                id="from"
                value={formState.from}
                onChange={(e) => handleChange('from', e.target.value)}
                placeholder="Nama atau alias kamu"
                disabled={isLoading}
              />
            </div>
            <div className="md:w-1/2">
              <Label htmlFor="to">Untuk</Label>
              <Input
                id="to"
                value={formState.to}
                onChange={(e) => handleChange('to', e.target.value)}
                placeholder="Nama penerima"
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="mb-6">
            <Label htmlFor="message">Pesan</Label>
            <Textarea
              id="message"
              value={formState.message}
              onChange={(e) => handleChange('message', e.target.value)}
              className="h-40"
              placeholder="Tulis pesanmu disini..."
              disabled={isLoading}
            />
          </div>

          <div className="mb-6">
            <Label htmlFor="gif">Tambahkan GIF (opsional)</Label>
            <div className="flex items-center">
              <Input
                id="gif"
                value={formState.gifUrl}
                onChange={(e) => handleChange('gifUrl', e.target.value)}
                placeholder="Tempelkan link GIF langsung (contoh: https://example.com/image.gif)"
                disabled={isLoading}
              />
              {formState.gifUrl && (
                <Button
                  onClick={() => handleChange('gifUrl', "")}
                  className="ml-2"
                  variant="ghost"
                >
                  ✕
                </Button>
              )}
            </div>
            {formState.gifUrl && (
              <div className="mt-4">
                <img
                  src={formState.gifUrl}
                  alt="Preview GIF"
                  className="max-w-xs rounded-md border border-gray-200"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                    setError('URL GIF tidak valid atau tidak dapat dimuat');
                  }}
                />
              </div>
            )}
            <Button
              asChild
              className="bg-gray-800 text-white px-6 md:px-8 py-2.5 md:py-3 rounded-full hover:bg-gray-900 transition-colors mt-2"
            >
              <Link href="https://gifunand.vercel.app" target="_blank">
                Cari GIF
              </Link>
            </Button>
          </div>

          <div className="mb-6 relative">
            <Label htmlFor="song">Cari Lagu</Label>
            <div className="flex items-center">
              <Input
                id="song"
                value={formState.song}
                onChange={(e) => handleChange('song', e.target.value)}
                placeholder="Ketik judul lagu..."
                disabled={isLoading || isSearching || !!formState.selectedTrack}
              />
              {formState.selectedTrack && (
                <Button onClick={handleClearSelection} className="ml-2">
                  ✕
                </Button>
              )}
            </div>

            {isSearching && (
              <div className="absolute z-10 w-full bg-white p-2 text-sm text-gray-500">
                Mencari lagu...
              </div>
            )}

            {tracks.length > 0 && !formState.selectedTrack && (
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

            {formState.selectedTrack && (
              <div className="mt-4 flex items-center">
                {formState.selectedTrack.cover_url && (
                  <img
                    src={formState.selectedTrack.cover_url}
                    alt={formState.selectedTrack.name}
                    className="w-12 h-12 mr-4 object-cover rounded"
                  />
                )}
                <div>
                  <div className="font-medium line-clamp-1">
                    {formState.selectedTrack.name}
                  </div>
                  <div className="text-sm text-gray-500 line-clamp-1">
                    {formState.selectedTrack.artist}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="text-center">
            <Button
              type="submit"
              className="bg-gray-800 text-white px-8 py-3 rounded-full hover:bg-gray-900 text-lg"
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