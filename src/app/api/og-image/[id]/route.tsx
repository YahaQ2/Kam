
import { ImageResponse } from 'next/server'
import { fetchMessage } from '@/lib/api'

export const runtime = 'edge'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const messageId = searchParams.get('id')

    if (!messageId) {
      return new Response('Message ID is required', { status: 400 })
    }

    // Fetch message data from your API
    const response = await fetch(`https://unand.vercel.app/v1/api/menfess-spotify-search/${messageId}`)
    if (!response.ok) {
      throw new Error('Failed to fetch message')
    }

    const data = await response.json()
    const message = data?.data?.[0]

    if (!message) {
      return new Response('Message not found', { status: 404 })
    }

    // Generate dynamic OG image
    return new ImageResponse(
      (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            width: '1200px',
            height: '630px',
            backgroundColor: '#ffffff',
            padding: '40px',
            fontFamily: 'sans-serif',
          }}
        >
          <div
            style={{
              fontSize: '48px',
              fontWeight: 'bold',
              color: '#1a1a1a',
              marginBottom: '20px',
              textAlign: 'center',
            }}
          >
            Message for {message.recipient}
          </div>
          <div
            style={{
              fontSize: '24px',
              color: '#4a4a4a',
              maxWidth: '800px',
              textAlign: 'center',
              lineHeight: '1.4',
            }}
          >
            {message.message.length > 140
              ? `${message.message.substring(0, 140)}...`
              : message.message}
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    )
  } catch (error) {
    console.error('Error generating OG image:', error)
    return new Response('Failed to generate image', { status: 500 })
  }
}