"use client";

import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/ui/navbar";
import { Footer } from "@/components/ui/footer";
import { useEffect, useState, useRef } from "react";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { Loader2 } from "lucide-react";
import { getTrackInfo } from "@/lib/spotify";

dayjs.extend(utc);
dayjs.extend(timezone);

declare global {
  interface Window {
    onSpotifyIframeApiReady: (IFrameAPI: any) => void;
  }
}

type MessageType = {
  id: number;
  sender: string;
  recipient: string;
  message: string;
  gif_url: string;
  track?: {
    spotify_embed_link?: string;
  };
  created_at: string;
};

function extractTrackId(embedLink: string) {
  const match = embedLink.match(/track\/([a-zA-Z0-9]+)/);
  const trackId = match ? match[1] : null;
  console.log('🎵 Extracted Spotify Track ID:', trackId);
  return trackId;
}

const SpotifyEmbed = ({ trackId }: { trackId: string }) => {
  const embedRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    console.log('🎵 Initializing Spotify Embed for track:', trackId);
    
    const script = document.createElement("script");
    script.src = "https://open.spotify.com/embed/iframe-api/v1";
    script.async = true;
