import { Button } from "@/components/ui/button";
import { RefreshCw, Heart, Printer, Copy, Check } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export interface GameResult {
  title: string;
  genre: string;
  bestFor: string;
  energyLevel: string;
  overview: string;
  setup: string;
  materials: string[];
  rules: {
    objective: string;
    turnOrder: string;
    howToWin: string;
    notAllowed: string;
  };
  howToPlay: string[];
  safetyNotes: string[];
  learningBenefits: string[];
  variations: {
    easier: string;
    harder: string;
  };
  estimatedDuration: string;
}

interface GameOutputProps {
  game: GameResult;
  onRegenerate: () => void;
  isLoading: boolean;
}

export const GameOutput = ({ game, onRegenerate, isLoading }: GameOutputProps) => {
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const text = formatGameAsText(game);
    await navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    printWindow.document.write(`
      <html><head><title>${game.title}</title>
      <style>body{font-family:system-ui;padding:2rem;max-width:800px;margin:0 auto}h1{color:#6b21a8}h2{color:#7c3aed;border-bottom:1px solid #e5e7eb;padding-bottom:0.5rem}ul{padding-left:1.5rem}li{margin-bottom:0.25rem}</style>
      </head><body>${formatGameAsHtml(game)}</body></html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const handleSave = () => {
    setSaved(!saved);
    toast.success(saved ? "Removed from favorites" : "Saved to favorites!");
  };

  return (
    <div className="bg-gradient-card border border-border rounded-2xl p-6 md:p-8 glow-border space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-display font-bold text-gradient">{game.title}</h2>
          <p className="text-muted-foreground mt-1">{game.genre} • {game.bestFor} • {game.energyLevel}</p>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <Button variant="ghost-muted" size="icon" onClick={onRegenerate} disabled={isLoading} title="Regenerate">
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          </Button>
          <Button variant="ghost-muted" size="icon" onClick={handleSave} title="Save to Favorites">
            <Heart className={`h-4 w-4 ${saved ? "fill-primary text-primary" : ""}`} />
          </Button>
          <Button variant="ghost-muted" size="icon" onClick={handlePrint} title="Print Game">
            <Printer className="h-4 w-4" />
          </Button>
          <Button variant="ghost-muted" size="icon" onClick={handleCopy} title="Copy to Clipboard">
            {copied ? <Check className="h-4 w-4 text-primary" /> : <Copy className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Overview */}
      <Section title="🎯 Game Overview">
        <p className="text-foreground/80">{game.overview}</p>
      </Section>

      {/* Setup */}
      <Section title="⚙️ Setup">
        <p className="text-foreground/80">{game.setup}</p>
      </Section>

      {/* Materials */}
      {game.materials.length > 0 && (
        <Section title="🧰 Materials Needed">
          <ul className="list-disc list-inside space-y-1 text-foreground/80">
            {game.materials.map((m, i) => <li key={i}>{m}</li>)}
          </ul>
        </Section>
      )}

      {/* Rules */}
      <Section title="📜 Game Rules">
        <div className="space-y-3 text-foreground/80">
          <div><span className="font-medium text-foreground">Objective:</span> {game.rules.objective}</div>
          <div><span className="font-medium text-foreground">Turn Order:</span> {game.rules.turnOrder}</div>
          <div><span className="font-medium text-foreground">How to Win:</span> {game.rules.howToWin}</div>
          <div><span className="font-medium text-foreground">Not Allowed:</span> {game.rules.notAllowed}</div>
        </div>
      </Section>

      {/* How to Play */}
      <Section title="🎮 How to Play">
        <ol className="list-decimal list-inside space-y-2 text-foreground/80">
          {game.howToPlay.map((step, i) => <li key={i}>{step}</li>)}
        </ol>
      </Section>

      {/* Safety */}
      <Section title="🛡️ Safety Notes">
        <ul className="list-disc list-inside space-y-1 text-foreground/80">
          {game.safetyNotes.map((n, i) => <li key={i}>{n}</li>)}
        </ul>
      </Section>

      {/* Learning Benefits */}
      <Section title="🧠 Learning Benefits">
        <ul className="list-disc list-inside space-y-1 text-foreground/80">
          {game.learningBenefits.map((b, i) => <li key={i}>{b}</li>)}
        </ul>
      </Section>

      {/* Variations */}
      <Section title="🔄 Variations">
        <div className="space-y-2 text-foreground/80">
          <div><span className="font-medium text-foreground">Easier Version:</span> {game.variations.easier}</div>
          <div><span className="font-medium text-foreground">Harder Version:</span> {game.variations.harder}</div>
        </div>
      </Section>

      {/* Duration */}
      <div className="text-center pt-4 border-t border-border">
        <span className="text-muted-foreground">⏱ Estimated Duration: </span>
        <span className="text-foreground font-medium">{game.estimatedDuration}</span>
      </div>
    </div>
  );
};

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="space-y-2">
    <h3 className="text-lg font-display font-semibold text-foreground">{title}</h3>
    {children}
  </div>
);

function formatGameAsText(game: GameResult): string {
  return `${game.title}
Genre: ${game.genre}
Best For: ${game.bestFor}
Energy Level: ${game.energyLevel}

OVERVIEW: ${game.overview}

SETUP: ${game.setup}

MATERIALS: ${game.materials.join(", ") || "None"}

RULES:
- Objective: ${game.rules.objective}
- Turn Order: ${game.rules.turnOrder}
- How to Win: ${game.rules.howToWin}
- Not Allowed: ${game.rules.notAllowed}

HOW TO PLAY:
${game.howToPlay.map((s, i) => `${i + 1}. ${s}`).join("\n")}

SAFETY: ${game.safetyNotes.join(". ")}

LEARNING BENEFITS: ${game.learningBenefits.join(", ")}

VARIATIONS:
- Easier: ${game.variations.easier}
- Harder: ${game.variations.harder}

Duration: ${game.estimatedDuration}`;
}

function formatGameAsHtml(game: GameResult): string {
  return `<h1>${game.title}</h1>
<p><strong>${game.genre}</strong> • ${game.bestFor} • ${game.energyLevel}</p>
<h2>Overview</h2><p>${game.overview}</p>
<h2>Setup</h2><p>${game.setup}</p>
<h2>Materials</h2><ul>${game.materials.map(m => `<li>${m}</li>`).join("")}</ul>
<h2>Rules</h2>
<p><strong>Objective:</strong> ${game.rules.objective}</p>
<p><strong>Turn Order:</strong> ${game.rules.turnOrder}</p>
<p><strong>How to Win:</strong> ${game.rules.howToWin}</p>
<p><strong>Not Allowed:</strong> ${game.rules.notAllowed}</p>
<h2>How to Play</h2><ol>${game.howToPlay.map(s => `<li>${s}</li>`).join("")}</ol>
<h2>Safety Notes</h2><ul>${game.safetyNotes.map(n => `<li>${n}</li>`).join("")}</ul>
<h2>Learning Benefits</h2><ul>${game.learningBenefits.map(b => `<li>${b}</li>`).join("")}</ul>
<h2>Variations</h2><p><strong>Easier:</strong> ${game.variations.easier}</p><p><strong>Harder:</strong> ${game.variations.harder}</p>
<p><strong>Duration:</strong> ${game.estimatedDuration}</p>`;
}
