/**
 * API utility functions for fetching message data
 * This module centralizes API call logic for message-related operations
 */

/**
 * Fetches a single message by its ID from the API
 * 
 * @param messageId - The unique identifier for the message to retrieve
 * @returns A Promise that resolves to the message data or null if not found
 */
export async function fetchMessage(messageId: string) {
  try {
    // Make API request to the backend service
    const response = await fetch(`https://unand.vercel.app/v1/api/menfess-spotify-search/${messageId}`);
    
    // Check if response is successful
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API error (${response.status}): ${errorText}`);
      return null;
    }
    
    // Parse the JSON response
    const data = await response.json();
    
    // Validate response format
    if (!data?.status || !data?.data?.[0]) {
      console.error("Invalid data format from API:", data);
      return null;
    }
    
    // Return the first message from the data array
    return data.data[0];
  } catch (error) {
    // Log any errors that occur during the fetch operation
    console.error("Error fetching message:", error);
    return null;
  }
}

/**
 * Type definition for the message data structure
 * Ensures consistent typing across components that use message data
 */
export type MessageType = {
  id: number;
  sender: string;
  recipient: string;
  message: string;
  gif_url: string | null;
  spotify_id?: string | null;
  created_at: string;
};

/**
 * Helper function to format message creation date
 * Converts UTC timestamp to Indonesia timezone (Asia/Jakarta)
 * 
 * @param dateString - ISO date string from the API
 * @returns Formatted date string in DD MMM YYYY, HH:MM format
 */
export function formatMessageDate(dateString: string): string {
  try {
    // Note: This requires dayjs with timezone plugins configured
    const dayjs = require('dayjs');
    const utc = require('dayjs/plugin/utc');
    const timezone = require('dayjs/plugin/timezone');
    
    dayjs.extend(utc);
    dayjs.extend(timezone);
    
    return dayjs.utc(dateString).tz("Asia/Jakarta").format("DD MMM YYYY, HH:mm");
  } catch (error) {
    console.error("Error formatting date:", error);
    return dateString; // Return original string if formatting fails
  }
}