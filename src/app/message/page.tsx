/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Navbar } from "@/components/ui/navbar";
import { Footer } from "@/components/ui/footer";
import { SuccessModal } from "@/components/success-modal";
import { Mic, Square, Loader2 } from "lucide-react";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

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
  voiceNoteUrl: string;
}

const SpotifyPreview = ({ trackId }: { trackId: string }) => {
  return (
    <div className="mt-4">
      <iframe
        src={`https://open.spotify.com/embed/track/${trackId}`}
        width="100%"
        height="80"
        frameBorder="0"
        allow="encrypted-media"
        className="rounded-lg"
      />
    </div>
  );
};

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
    "voiceNoteUrl" in state &&
    typeof state.from === "string" &&
    typeof state.to === "string" &&
    typeof state.message === "string" &&
    typeof state.song === "string" &&
    typeof state.gifUrl === "string" &&
    typeof state.spotifyId === "string" &&
    typeof state.voiceNoteUrl === "string" &&
    (state.selectedTrack === null ||
      (typeof state.selectedTrack === "object" &&
        state.selectedTrack !== null &&
        "id" in state.selectedTrack &&
        "name" in state.selectedTrack &&
        "artist" in state.selectedTrack &&
        "album" in state.selectedTrack &&
        "cover_url" in state.selectedTrack &&
        typeof state.selectedTrack.id === "string" &&
        typeof state.selectedTrack.name === "string" &&
        typeof state.selectedTrack.artist === "string" &&
        typeof state.selectedTrack.album === "string" &&
        typeof state.selectedTrack.cover_url === "string"))
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
    voiceNoteUrl: "",
  });

  const [tracks, setTracks] = useState<SpotifyTrack[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Voice recording states
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

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

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = handleRecordingStop;

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingDuration(0);

      timerRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
    } catch (err) {
      console.error("Error accessing microphone:", err);
      setError("Gagal mengakses mikrofon. Pastikan mikrofon diizinkan dan coba lagi.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current?.stream?.getTracks().forEach(track => track.stop());
    }

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    setIsRecording(false);
  };

  const handleRecordingStop = async () => {
    if (chunksRef.current.length === 0) return;

    const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
    await uploadVoiceNote(audioBlob);
  };

  const uploadVoiceNote = async (audioBlob: Blob) => {
    setIsUploading(true);
    try {
      const fileName = `voice-notes${Date.now()}.webm`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('media')
        .upload(fileName, audioBlob);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('media')
        .getPublicUrl(uploadData.path);
           
      if (!urlData.publicUrl) {
        throw new Error("Gagal mendapatkan URL publik.");
      }

      setFormState(prev => ({
        ...prev,
        voiceNoteUrl: urlData.publicUrl
      }));

      const formData = new FormData();
      formData.append('media', audioBlob, fileName);

      const response = await fetch('https://unand.vercel.app/v1/api/upload-voice-note', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Gagal mengunggah voice note ke server");
      }
    } catch (error) {
      console.error("Error uploading voice note:", error);
      setError("voice note berhasil terupload lengkapi bagian to, from,massage, dan song");
    } finally {
      setIsUploading(false);
    }
  };

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

  const handleRemoveVoiceNote = () => {
    setFormState(prev => ({
      ...prev,
      voiceNoteUrl: ""
    }));

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

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
          gif_url: formState.gifUrl,
          voice_note_url: formState.voiceNoteUrl,
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
        voiceNoteUrl: "",
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
            <Label>Voice Note (opsional)</Label>
            <div className="mt-2 border rounded-lg p-4 bg-gray-50">
              {!formState.voiceNoteUrl && !isRecording && !isUploading && (
                <Button
                  type="button"
                  onClick={startRecording}
                  className="flex items-center space-x-2 bg-red-500 hover:bg-red-600 text-white"
                  disabled={isLoading}
                >
                  <Mic size={18} />
                  <span>Rekam Voice Note</span>
                </Button>
              )}

              {isRecording && (
                <div className="flex items-center space-x-4">
                  <div className="flex-1">
                    <div className="text-red-500 font-semibold flex items-center">
                      <span className="inline-block w-2 h-2 rounded-full bg-red-500 mr-2 animate-pulse"></span>
                      Merekam... {formatDuration(recordingDuration)}
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                      <div className="bg-red-500 h-1.5 rounded-full" style={{ width: `${Math.min(recordingDuration / 60 * 100, 100)}%` }}></div>
                    </div>
                  </div>
                  <Button
                    type="button"
                    onClick={stopRecording}
                    className="flex items-center space-x-2 bg-gray-700 hover:bg-gray-800 text-white"
                  >
                    <Square size={16} />
                    <span>Berhenti</span>
                  </Button>
                </div>
              )}

              {isUploading && (
                <div className="flex items-center space-x-2 text-gray-600">
                  <Loader2 className="animate-spin" size={18} />
                  <span>Mengunggah rekaman...</span>
                </div>
              )}

              {formState.voiceNoteUrl && (
                <div className="flex flex-col space-y-2">
                  <audio
                    ref={audioRef}
                    src={formState.voiceNoteUrl}
                    controls
                    className="w-full"
                  />
                  <Button
                    type="button"
                    onClick={handleRemoveVoiceNote}
                    variant="outline"
                    className="self-start text-red-500 hover:text-red-700"
                  >
                    Hapus Voice Note
                  </Button>
                </div>
              )}
            </div>
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
              <div className="mt-4">
                <div className="flex items-center">
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
                <SpotifyPreview trackId={formState.selectedTrack.id} />
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
