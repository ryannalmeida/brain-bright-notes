import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { title, content } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("Generating tag suggestions...");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: "You are a helpful assistant that suggests relevant tags for notes. Return 3-5 concise, lowercase tags separated by commas. Tags should be single words or short phrases (max 2 words). Only return the tags, nothing else."
          },
          {
            role: "user",
            content: `Suggest tags for this note:\n\nTitle: ${title}\n\nContent: ${content}`
          }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "suggest_tags",
              description: "Return 3-5 relevant tags for the note",
              parameters: {
                type: "object",
                properties: {
                  tags: {
                    type: "array",
                    items: {
                      type: "string"
                    },
                    minItems: 3,
                    maxItems: 5
                  }
                },
                required: ["tags"],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "suggest_tags" } }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add credits to your workspace." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const toolCall = data.choices[0].message.tool_calls?.[0];
    
    if (toolCall && toolCall.function.name === "suggest_tags") {
      const result = JSON.parse(toolCall.function.arguments);
      const tags = result.tags;

      console.log("Tags generated successfully:", tags);

      return new Response(
        JSON.stringify({ tags }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    throw new Error("Failed to generate tags");
  } catch (error) {
    console.error("Error in suggest-tags function:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
