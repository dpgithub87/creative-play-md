import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { SparkleBackground } from "@/components/SparkleBackground";
import { GameForm, GameFormData } from "@/components/GameForm";
import { GameResult } from "@/components/GameOutput";
import { useGame } from "@/contexts/GameContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { Sparkles, Lock } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

const Index = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { setPendingGame } = useGame();
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleGenerate = async (data: GameFormData) => {
    setIsLoading(true);
    try {
      const { data: result, error } = await supabase.functions.invoke("generate-game", {
        body: data,
      });
      if (error) throw error;
      if (result?.error) throw new Error(result.error);
      setPendingGame(result as GameResult);

      // If already signed in, go directly
      if (user) {
        navigate("/game");
      }
    } catch (err: any) {
      console.error("Generation failed:", err);
      toast.error(err.message || "Failed to generate game. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignInToSee = async () => {
    const { error } = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin + "/game",
    });
    if (error) {
      toast.error("Sign-in failed. Please try again.");
    }
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

        {/* Form Card - only show when signed in */}
        {user && (
          <div className="bg-gradient-card border border-border rounded-2xl p-6 md:p-8 glow-border mb-10">
            <GameForm onGenerate={handleGenerate} isLoading={isLoading} />
          </div>
        )}

        {/* Sign in prompt when not authenticated */}
        {!user && (
          <div className="flex justify-center mb-10">
            <Button
              onClick={handleSignInToSee}
              className="h-14 px-8 text-lg font-display font-semibold rounded-xl bg-gradient-to-r from-background via-primary to-background border border-primary/40 text-[hsl(0,0%,78%)] hover:text-[hsl(0,0%,90%)] hover:border-primary/60 shadow-[0_0_30px_hsl(var(--glow-primary)/0.3)] hover:shadow-[0_0_50px_hsl(var(--glow-primary)/0.5)] transition-all duration-300"
            >
              <Lock className="h-5 w-5 mr-2" />
              Please sign in to generate your game
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
