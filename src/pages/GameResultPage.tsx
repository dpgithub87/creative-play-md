import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useGame } from "@/contexts/GameContext";
import { GameOutput } from "@/components/GameOutput";
import { SparkleBackground } from "@/components/SparkleBackground";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const GameResultPage = () => {
  const { user, loading } = useAuth();
  const { pendingGame } = useGame();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/");
    }
  }, [user, loading, navigate]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!pendingGame) {
    return (
      <div className="min-h-screen bg-gradient-hero relative">
        <SparkleBackground />
        <div className="relative z-10 container max-w-4xl mx-auto px-4 py-16 text-center">
          <Sparkles className="h-8 w-8 text-primary animate-float mx-auto mb-4" />
          <h1 className="text-3xl font-display font-bold text-gradient mb-4">No Game Found</h1>
          <p className="text-muted-foreground mb-6">Generate a game first, then come back here.</p>
          <Button onClick={() => navigate("/")} variant="glow">Go Back & Generate</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-hero relative">
      <SparkleBackground />
      <div className="relative z-10 container max-w-4xl mx-auto px-4 py-8 md:py-16">
        <header className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Sparkles className="h-6 w-6 text-primary animate-float" />
            <h1 className="text-2xl md:text-3xl font-display font-bold text-gradient">CreatePixels</h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground hidden sm:inline">{user?.email}</span>
            <Button variant="ghost-muted" size="sm" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-1" /> Sign Out
            </Button>
          </div>
        </header>
        <div className="mb-6">
          <h2 className="text-2xl md:text-3xl font-display font-bold text-gradient">
            This is your game, {user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email?.split("@")[0] || "Player"}
          </h2>
        </div>
        <GameOutput game={pendingGame} onRegenerate={() => navigate("/")} isLoading={false} />
      </div>
    </div>
  );
};

export default GameResultPage;
