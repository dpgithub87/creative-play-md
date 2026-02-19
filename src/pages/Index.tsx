import { useState } from "react";
import { SparkleBackground } from "@/components/SparkleBackground";
import { GameForm, GameFormData } from "@/components/GameForm";
import { GameOutput, GameResult } from "@/components/GameOutput";
import { generateMockGame } from "@/lib/mockGameGenerator";
import { Sparkles } from "lucide-react";

const Index = () => {
  const [game, setGame] = useState<GameResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastFormData, setLastFormData] = useState<GameFormData | null>(null);

  const handleGenerate = async (data: GameFormData) => {
    setIsLoading(true);
    setLastFormData(data);
    // Simulate API delay
    await new Promise((r) => setTimeout(r, 1500));
    const result = generateMockGame(data);
    setGame(result);
    setIsLoading(false);
  };

  const handleRegenerate = () => {
    if (lastFormData) handleGenerate(lastFormData);
  };

  return (
    <div className="min-h-screen bg-gradient-hero relative">
      <SparkleBackground />

      <div className="relative z-10 container max-w-4xl mx-auto px-4 py-8 md:py-16">
        {/* Header */}
        <header className="text-center mb-10 md:mb-14">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Sparkles className="h-8 w-8 text-primary animate-float" />
            <h1 className="text-4xl md:text-5xl font-display font-bold text-gradient">
              CreatePixels
            </h1>
            <Sparkles className="h-8 w-8 text-accent animate-float" style={{ animationDelay: "1s" }} />
          </div>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            AI-powered indoor game generator for children. Safe, creative, and endlessly fun.
          </p>
        </header>

        {/* Form Card */}
        <div className="bg-gradient-card border border-border rounded-2xl p-6 md:p-8 glow-border mb-10">
          <GameForm onGenerate={handleGenerate} isLoading={isLoading} />
        </div>

        {/* Output */}
        {game && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <GameOutput game={game} onRegenerate={handleRegenerate} isLoading={isLoading} />
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
