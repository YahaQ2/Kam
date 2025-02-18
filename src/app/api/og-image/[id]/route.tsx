import { ImageResponse } from '@vercel/og';

export const runtime = 'edge';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const response = await fetch(`https://unand.vercel.app/v1/api/menfess-spotify-search/${id}`);
    const data = await response.json();
    const message = data.data[0];

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#fff',
            padding: 50,
          }}
        >
          <div style={{ fontSize: 42, marginBottom: 20 }}>💌 Message for {message.recipient}</div>
          <div style={{ fontSize: 32, marginBottom: 30, maxWidth: 800, textAlign: 'center' }}>
            "{message.message}"
          </div>
          <div style={{ display: 'flex', gap: 20 }}>
            <div style={{ fontSize: 24 }}>From: {message.sender}</div>
            <div style={{ fontSize: 24 }}>To: {message.recipient}</div>
          </div>
          {message.spotify_id && (
            <div style={{ marginTop: 30 }}>
              <img
                src={`https://i.scdn.co/image/${message.spotify_id}`}
                alt="Spotify Track"
                width