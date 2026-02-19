import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are an expert indoor game designer for children. You create safe, creative, original indoor games tailored to specific inputs.

CRITICAL RULES:
- Games must be age-appropriate
- Never include choking hazards for toddlers
- Respect prop limits strictly: if "No props" is selected, use ZERO materials
- Match vocabulary complexity to the age group
- Match physical intensity to the selected energy level
- Ensure the game fits the described space
- Avoid unsafe activities (no climbing furniture, no dangerous jumps)
- If Horror genre is selected for younger children, keep it playful and not psychologically distressing
- Every game must include clear rules separate from step-by-step instructions
- Make every game feel unique and imaginative
- Avoid basic generic games unless creatively reinvented

You MUST respond with valid JSON matching this exact structure (no markdown, no code fences, just raw JSON):
{
  "title": "string",
  "genre": "string",
  "bestFor": "string (age group + number of players)",
  "energyLevel": "string",
  "overview": "string (short exciting summary)",
  "setup": "string (clear preparation instructions)",
  "materials": ["array of strings, empty array if no props"],
  "rules": {
    "objective": "string",
    "turnOrder": "string",
    "howToWin": "string",
    "notAllowed": "string"
  },
  "howToPlay": ["array of step-by-step strings"],
  "safetyNotes": ["array of age-specific safety reminders"],
  "learningBenefits": ["array of learning benefits"],
  "variations": {
    "easier": "string",
    "harder": "string"
  },
  "estimatedDuration": "string"
}`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { ageGroup, players, props, space, energy, duration, learningGoal, gameStyle } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const ageLabels: Record<string, string> = {
      toddlers: "Toddlers (2–3)",
      preschool: "Preschool (4–5)",
      kids: "Kids (6–9)",
      preteens: "Preteens (10–12)",
    };

    const propLabels: Record<string, string> = {
      none: "No props at all (zero materials)",
      few: "1–3 simple props",
      unlimited: "Unlimited props available",
    };

    const userPrompt = `Create an original indoor game with these specifications:
- Age Group: ${ageLabels[ageGroup] || ageGroup}
- Number of Players: ${players}
- Available Props: ${propLabels[props] || props}
- Space Available: ${space || "Standard room"}
- Energy Level: ${energy}
- Time Duration: ${duration} minutes
- Learning Goal: ${learningGoal || "General fun and creativity"}
- Game Style/Genre: ${gameStyle}

Generate a unique, creative, and safe indoor game. Remember: if no props are selected, materials array MUST be empty.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI usage limit reached. Please add credits." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const text = await response.text();
      console.error("AI gateway error:", response.status, text);
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) throw new Error("No content in AI response");

    // Parse the JSON response, stripping markdown fences if present
    let cleaned = content.trim();
    if (cleaned.startsWith("```")) {
      cleaned = cleaned.replace(/^```(?:json)?\s*/, "").replace(/```\s*$/, "");
    }

    const game = JSON.parse(cleaned);

    return new Response(JSON.stringify(game), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-game error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Failed to generate game" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
