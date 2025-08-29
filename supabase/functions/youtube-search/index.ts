// supabase/functions/youtube-search/index.ts

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from "../_shared/cors.ts"

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  try {
    const { query } = await req.json()

    if (!query || typeof query !== "string") {
      return new Response(
        JSON.stringify({ error: "Query parameter is required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      )
    }

    const youtubeApiKey = Deno.env.get("YOUTUBE_API_KEY")
    if (!youtubeApiKey) {
      console.error("YOUTUBE_API_KEY not found in environment variables")
      return new Response(
        JSON.stringify({ error: "YouTube API key not configured" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      )
    }

    // Call YouTube API
    const url =
      `https://www.googleapis.com/youtube/v3/search?` +
      new URLSearchParams({
        part: "snippet",
        q: query,
        type: "video",
        maxResults: "6",
        key: youtubeApiKey,
      })

    const response = await fetch(url)

    if (!response.ok) {
      const errorText = await response.text()
      console.error("YouTube API Error:", response.status, errorText)

      return new Response(
        JSON.stringify({ error: "Failed to fetch YouTube videos" }),
        {
          status: response.status,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      )
    }

    const data = await response.json()

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    })
  } catch (error) {
    console.error("Error in youtube-search function:", error)

    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    )
  }
})
