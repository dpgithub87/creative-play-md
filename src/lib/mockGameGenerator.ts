import { GameResult } from "@/components/GameOutput";
import type { GameFormData } from "@/components/GameForm";

// Mock game generation for demo purposes
// This will be replaced with AI API call when Cloud is enabled
export function generateMockGame(data: GameFormData): GameResult {
  const ageLabels: Record<string, string> = {
    toddlers: "Toddlers (2–3)",
    preschool: "Preschool (4–5)",
    kids: "Kids (6–9)",
    preteens: "Preteens (10–12)",
  };

  const titles: Record<string, string[]> = {
    Funny: ["The Giggle Quest", "Silly Statue Showdown", "Laugh Lab"],
    Horror: ["Shadow Seekers", "The Haunted Hallway", "Monster Mash Escape"],
    Adventure: ["Treasure Room Expedition", "The Floor is Lava Quest", "Secret Agent Mission"],
    Mystery: ["The Missing Teddy Case", "Detective Dash", "Clue Crawlers"],
    Fantasy: ["Dragon's Den Duel", "Enchanted Kingdom Quest", "Wizard's Tower"],
    Superhero: ["Hero Training Academy", "Cape & Courage Challenge", "Power-Up Patrol"],
    Educational: ["Brain Builder Bonanza", "Number Ninja", "Word Wizard Challenge"],
    default: ["Creative Indoor Challenge", "Imagination Station", "The Ultimate Indoor Game"],
  };

  const styleKey = Object.keys(titles).find(
    (k) => data.gameStyle.toLowerCase().includes(k.toLowerCase())
  ) || "default";

  const titleOptions = titles[styleKey];
  const title = titleOptions[Math.floor(Math.random() * titleOptions.length)];

  const noProps = data.props === "none";

  return {
    title,
    genre: data.gameStyle || "Creative",
    bestFor: `${ageLabels[data.ageGroup] || "All ages"} • ${data.players} player${data.players > 1 ? "s" : ""}`,
    energyLevel: data.energy.charAt(0).toUpperCase() + data.energy.slice(1),
    overview: `An exciting ${data.gameStyle.toLowerCase()} indoor game designed for ${data.players} player${data.players > 1 ? "s" : ""} in a ${data.space || "standard room"}. This game combines imagination with ${data.energy} energy activities that are perfect for ${ageLabels[data.ageGroup] || "children"}.`,
    setup: noProps
      ? "Clear a safe play area in the center of the room. No materials needed — just enthusiasm and creativity!"
      : `Clear a safe play area and gather your props. Arrange the space so all players can move freely in the ${data.space || "available area"}.`,
    materials: noProps
      ? []
      : data.props === "few"
      ? ["3 soft cushions or pillows", "A timer or phone", "Paper and markers"]
      : ["Cushions and blankets", "Paper, markers, and tape", "Small toys or figurines", "A timer", "Optional: flashlight for dramatic effect"],
    rules: {
      objective: `Be the first player to complete all game challenges while staying in character as a ${data.gameStyle.toLowerCase()} hero!`,
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
      `Ensure the play area is free of sharp objects and trip hazards.`,
      data.ageGroup === "toddlers" ? "Adult supervision required at all times. No small objects." : "An adult should be nearby to supervise.",
      "If playing on hard floors, consider using a soft mat.",
      "Take breaks if any player feels tired or overwhelmed.",
    ],
    learningBenefits: [
      data.learningGoal || "Creativity and imagination",
      "Social interaction and communication",
      "Physical coordination",
      "Turn-taking and patience",
    ],
    variations: {
      easier: "Reduce the number of challenges to 2 per player and allow longer time per turn.",
      harder: "Add a time pressure element — each turn must be completed in 15 seconds, and add bonus mystery challenges.",
    },
    estimatedDuration: data.duration === "5-10" ? "5–10 minutes" : data.duration === "15-30" ? "15–30 minutes" : "30+ minutes",
  };
}
