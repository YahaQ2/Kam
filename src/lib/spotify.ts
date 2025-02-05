const clientId = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID;
const clientSecret = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_SECRET;
const tokenEndpoint = "https://accounts.spotify.com/api/token";

let accessToken = "";
let tokenExpiry = 0;

// Fungsi untuk mendapatkan token akses Spotify
async function getAccessToken() {
  if (accessToken && tokenExpiry > Date.now()) {
    return accessToken;
  }

  const authHeader = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

  try {
    const response = await fetch(tokenEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${authHeader}`,
      },
      body: "grant_type=client_credentials",
    });

    if (!response.ok) {
      throw new Error("Failed to get Spotify access token");
    }

    const data = await response.json();
    accessToken = data.access_token;
    tokenExpiry = Date.now() + data.expires_in * 1000;

    return accessToken;
  } catch (error) {
    console.error("Error fetching Spotify access token:", error);
    throw error;
  }
}

// Fungsi untuk mendapatkan informasi track berdasarkan ID
export async function getTrackInfo(trackId: string): Promise<SpotifyApi.TrackObjectFull | null> {
  const token = await getAccessToken();
  
  try {
    const response = await fetch(`https://api.spotify.com/v1/tracks/${trackId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch track info");
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching track info:", error);
    return null;
  }
}