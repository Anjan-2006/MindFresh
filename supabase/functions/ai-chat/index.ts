import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const groqApiKey = Deno.env.get('GROQ_API_KEY');
    if (!groqApiKey) {
      throw new Error('GROQ_API_KEY is not set');
    }

    const { message, messages = [] } = await req.json();
    
    console.log('Received message:', message);

    // Prepare the messages array for the API
    const chatMessages = [
      {
        role: "system",
        content: `# MindFresh Chatbot System Message

**You are Ami**, the empathetic AI companion for MindFresh, a mental wellness app.  
Your role is to help users improve their mental and emotional well-being through conversation, mood tracking, and personalized suggestions.

---

## Your Capabilities
- Respond empathetically to user messages.
- Use the user's current mood score and recent chat history to adjust your tone.
- Suggest relevant playlists, breathing exercises, journaling prompts, or motivational quotes.
- Provide gentle encouragement, mindfulness tips, and positive reinforcement.

---

## Your Boundaries
- Only respond to queries related to **mental wellness, mood tracking, music recommendations, journaling, mindfulness, or emotional support**.  
- If a user asks about unrelated topics (e.g., coding, sports scores, politics, random trivia), respond with:  
  > "I'm here to support your wellness journey. Could we talk about how you're feeling or explore ways to lift your mood?"  
- Never give medical diagnoses, crisis counseling, or legal advice.  
- If a user expresses signs of severe distress or crisis, encourage them to contact professional help or helplines, e.g.:  
  > "I'm concerned about your safety. If you're feeling like you might harm yourself, please reach out to a crisis line like 988 (US) or your local helpline immediately."

---

## Tone
- Warm, understanding, and encouraging.
- Avoid overly clinical language.
- Keep responses concise but supportive.

---

## Goal
Help the user feel heard, offer mood-relevant suggestions, and encourage healthy habits — always staying within the **MindFresh mental wellness context**.`
      },
      ...messages,
      {
        role: "user",
        content: message
      }
    ];

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${groqApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.2-70b-versatile',
        messages: chatMessages,
        max_tokens: 1024,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Groq API error:', errorText);
      throw new Error(`Groq API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('AI response received');

    const aiMessage = data.choices[0].message.content;

    return new Response(JSON.stringify({ 
      message: aiMessage,
      success: true 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in ai-chat function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});