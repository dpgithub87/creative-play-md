import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { ageGroup, players, props, space, energy, duration, learningGoal, gameStyle } = body;

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const ageLabels: Record<string, string> = {
      toddlers: "Toddlers (2-3)",
      preschool: "Preschool (4-5)",
      kids: "Kids (6-9)",
      preteens: "Preteens (10-12)",
    };

    const propLabels: Record<string, string> = {
      none: "No props at all",
      few: "1-3 simple props",
      unlimited: "Unlimited props",
    };

    const prompt = `You are an indoor game designer for children. Create a safe, creative game with these specs:
Age: ${ageLabels[ageGroup] || ageGroup}, Players: ${players}, Props: ${propLabels[props] || props}, Space: ${space || "Standard room"}, Energy: ${energy}, Duration: ${duration} min, Learning: ${learningGoal || "General fun"}, Style: ${gameStyle}

Rules: age-appropriate, no choking hazards for toddlers, respect prop limits, if no props then materials must be empty array, match energy level, fit the space, no unsafe activities.

Return ONLY valid JSON (no markdown fences) with this structure:
{"title":"string","genre":"string","bestFor":"string","energyLevel":"string","overview":"string","setup":"string","materials":["strings"],"rules":{"objective":"string","turnOrder":"string","howToWin":"string","notAllowed":"string"},"howToPlay":["strings"],"safetyNotes":["strings"],"learningBenefits":["strings"],"variations":{"easier":"string","harder":"string"},"estimatedDuration":"string"}`;

    let game = null;

    // Try AI gateway
    try {
      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [{ role: "user", content: prompt }],
        }),
      });

      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again shortly." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits depleted. Please add credits." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (response.ok) {
        const data = await response.json();
        const content = data.choices?.[0]?.message?.content;
        if (content) {
          let cleaned = content.trim();
          if (cleaned.startsWith("```")) {
            cleaned = cleaned.replace(/^```(?:json)?\s*/, "").replace(/```\s*$/, "");
          }
          game = JSON.parse(cleaned);
        }
      } else {
        const text = await response.text();
        console.error("AI gateway error:", response.status, text);
        console.log("Falling back to built-in generator");
      }
    } catch (aiErr) {
      console.error("AI call failed, using fallback:", aiErr);
    }

    // Fallback generator if AI fails
    if (!game) {
      game = generateFallbackGame(body, ageLabels, propLabels);
    }

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

function generateFallbackGame(
  data: { ageGroup: string; players: number; props: string; space: string; energy: string; duration: string; learningGoal: string; gameStyle: string },
  ageLabels: Record<string, string>,
  propLabels: Record<string, string>,
) {
  const titles: Record<string, string[]> = {
    funny: ["The Giggle Quest", "Silly Statue Showdown", "Laugh Lab"],
    horror: ["Shadow Seekers", "The Haunted Hallway", "Monster Mash Escape"],
    adventure: ["Treasure Room Expedition", "The Floor is Lava Quest", "Secret Agent Mission"],
    mystery: ["The Missing Teddy Case", "Detective Dash", "Clue Crawlers"],
    fantasy: ["Dragon's Den Duel", "Enchanted Kingdom Quest", "Wizard's Tower"],
    superhero: ["Hero Training Academy", "Cape & Courage Challenge", "Power-Up Patrol"],
    educational: ["Brain Builder Bonanza", "Number Ninja", "Word Wizard Challenge"],
  };

  const defaultTitles = ["Creative Indoor Challenge", "Imagination Station", "The Ultimate Indoor Game"];
  const styleKey = Object.keys(titles).find((k) => data.gameStyle.toLowerCase().includes(k)) || "";
  const titleOptions = titles[styleKey] || defaultTitles;
  const title = titleOptions[Math.floor(Math.random() * titleOptions.length)];
  const noProps = data.props === "none";

  return {
    title,
    genre: data.gameStyle || "Creative",
    bestFor: `${ageLabels[data.ageGroup] || "All ages"} • ${data.players} player${data.players > 1 ? "s" : ""}`,
    energyLevel: data.energy.charAt(0).toUpperCase() + data.energy.slice(1),
    overview: `An exciting ${data.gameStyle.toLowerCase()} indoor game designed for ${data.players} player${data.players > 1 ? "s" : ""} in a ${data.space || "standard room"}. This game combines imagination with ${data.energy} energy activities that are perfect for ${ageLabels[data.ageGroup] || "children"}.`,
    setup: noProps
      ? "Clear a safe play area in the center of the room. No materials needed!"
      : `Clear a safe play area and gather your props. Arrange the space so all players can move freely.`,
    materials: noProps ? [] : data.props === "few"
      ? ["3 soft cushions or pillows", "A timer or phone", "Paper and markers"]
      : ["Cushions and blankets", "Paper, markers, and tape", "Small toys or figurines", "A timer", "Optional: flashlight"],
    rules: {
      objective: `Be the first player to complete all game challenges while staying in character!`,
      turnOrder: data.players > 1 ? "Players take turns clockwise. Each turn lasts 30 seconds." : "Play through each challenge sequentially.",
      howToWin: "Complete all challenges first, or earn the most points by the end of the timer.",
      notAllowed: "No running on slippery surfaces, no climbing on furniture, and no physical contact between players.",
    },
    howToPlay: [
      "All players gather in the center of the play area.",
      "The youngest player goes first (or rock-paper-scissors to decide).",
      "On your turn, draw an imaginary challenge card and act it out.",
      "Other players guess what you're doing — correct guesses earn both players a point.",
      "After everyone has had 3 turns, tally up the points.",
      "The player with the most points wins the round!",
    ],
    safetyNotes: [
      "Ensure the play area is free of sharp objects and trip hazards.",
      data.ageGroup === "toddlers" ? "Adult supervision required at all times." : "An adult should be nearby to supervise.",
      "If playing on hard floors, consider using a soft mat.",
      "Take breaks if any player feels tired.",
    ],
    learningBenefits: [
      data.learningGoal || "Creativity and imagination",
      "Social interaction and communication",
      "Physical coordination",
      "Turn-taking and patience",
    ],
    variations: {
      easier: "Reduce the number of challenges to 2 per player and allow longer time per turn.",
      harder: "Add a time pressure element — each turn must be completed in 15 seconds.",
    },
    estimatedDuration: data.duration === "5-10" ? "5-10 minutes" : data.duration === "15-30" ? "15-30 minutes" : "30+ minutes",
  };
}
