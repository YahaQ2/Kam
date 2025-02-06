interface AccessTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

let accessToken: string | null = null;
let tokenExpirationTime: number = 0;

/**
 * Mendapatkan access token dari Spotify API menggunakan client credentials flow.
 */
async function getAccessToken(): Promise<string> {
  if (accessToken && Date.now() < tokenExpirationTime) {
    return accessToken;
  }

  const clientId = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("Spotify client credentials tidak ditemukan. Pastikan environment variables sudah diset.");
  }

  const authHeader = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

  try {
    const response = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${authHeader}`,
      },
      body: "grant_type=client_credentials",
    });

    if (!response.ok) {
      throw new Error(`Gagal mendapatkan token: ${response.statusText}`);
    }

    const data: AccessTokenResponse = await response.json();
    accessToken = data.access_token;
    tokenExpirationTime = Date.now() + data.expires_in * 1000 - 60000; // Token diperbarui 1 menit sebelum expired

    return accessToken;
  } catch (error) {
    console.error("Error mendapatkan access token:", error);
    throw error;
  }
}

/**
 * Mendapatkan informasi track dari Spotify API.
 */
export async function getTrackInfo(trackId: string): Promise<SpotifyApi.TrackObjectFull | null> {
  try {
    const token = await getAccessToken();

    const response = await fetch(`https://api.spotify.com/v1/tracks/${trackId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error mengambil info track:", error);
    return null;
  }
}