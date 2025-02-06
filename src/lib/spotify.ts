interface AccessTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

let accessToken: string | null = null;
let tokenExpirationTime: number = 0;

/**
 * Mendapatkan access token dari Spotify API menggunakan client credentials flow.
 * @returns {Promise<string>} Access token untuk mengakses Spotify API.
 */
async function getAccessToken(): Promise<string> {
  // Jika access token masih valid, gunakan yang sudah ada
  if (accessToken && Date.now() < tokenExpirationTime) {
    return accessToken;
  }

  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("Missing Spotify client credentials. Please ensure SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET are set in your environment variables.");
  }

  // Encode client credentials ke base64
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
      throw new Error(`Failed to get access token: ${response.statusText}`);
    }

    const data: AccessTokenResponse = await response.json();
    accessToken = data.access_token;
    tokenExpirationTime = Date.now() + data.expires_in * 1000 - 60000; // Expire 1 menit lebih awal

    return accessToken;
  } catch (error) {
    console.error("Error getting access token:", error);
    throw error;
  }
}

/**
 * Mendapatkan informasi detail tentang sebuah track dari Spotify API.
 * @param {string} trackId - ID track Spotify.
 * @returns {Promise<SpotifyApi.TrackObjectFull | null>} Objek track atau null jika gagal.
 */
export async function getTrackInfo(trackId: string): Promise<SpotifyApi.TrackObjectFull | null> {
  try {
    const accessToken = await getAccessToken();

    const response = await fetch(`https://api.spotify.com/v1/tracks/${trackId}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        // Jika token expired, coba lagi sekali
        accessToken = null;
        return getTrackInfo(trackId);
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching track info:", error);
    return null;
  }
}