import type { NextApiRequest, NextApiResponse } from 'next';

interface TrackData {
  title: string;
  artist: string;
  cover_img: string;
}

interface MenfessResponse {
  status: boolean;
  data: Array<{
    id: number;
    sender: string;
    recipient: string;
    message: string;
    track?: TrackData;
    created_at: string;
  }>;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<MenfessResponse | { error: string }>
) {
  try {
    const apiResponse = await fetch('https://unand.vercel.app/v1/api/menfess-spotify-search');
    
    if (!apiResponse.ok) {
      throw new Error(`API responded with status ${apiResponse.status}`);
    }

    const data = await apiResponse.json();
    
    // Validasi data
    const validatedData = data.data.map((item: any) => ({
      id: item.id,
      sender: item.sender,
      recipient: item.recipient,
      message: item.message,
      track: item.track ? {
        title: item.track.title,
        artist: item.track.artist,
        cover_img: item.track.cover_img
      } : undefined,
      created_at: item.created_at
    }));

    res.status(200).json({
      status: true,
      data: validatedData
    });
    
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}