import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sparkles } from "lucide-react";

export interface GameFormData {
  ageGroup: string;
  players: number;
  props: string;
  space: string;
  energy: string;
  duration: string;
  learningGoal: string;
  gameStyle: string;
}

interface GameFormProps {
  onGenerate: (data: GameFormData) => void;
  isLoading: boolean;
}

export const GameForm = ({ onGenerate, isLoading }: GameFormProps) => {
  const [form, setForm] = useState<GameFormData>({
    ageGroup: "",
    players: 2,
    props: "",
    space: "",
    energy: "",
    duration: "",
    learningGoal: "",
    gameStyle: "",
  });

  const update = (key: keyof GameFormData, value: string | number) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.ageGroup || !form.props || !form.energy || !form.duration || !form.gameStyle) return;
    onGenerate(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Age Group */}
        <div className="space-y-2">
          <Label className="text-foreground/80">Age Group</Label>
          <Select value={form.ageGroup} onValueChange={(v) => update("ageGroup", v)}>
            <SelectTrigger className="glow-border">
              <SelectValue placeholder="Select age group" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="toddlers">Toddler (1–3)</SelectItem>
              <SelectItem value="older_kids">Older Kid (4–9)</SelectItem>
              <SelectItem value="preteens">Preteen (10–12)</SelectItem>
              <SelectItem value="teens">Teen (13–17)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Number of Players */}
        <div className="space-y-2">
          <Label className="text-foreground/80">Number of Players</Label>
          <Input
            type="number"
            min={1}
            max={30}
            value={form.players}
            onChange={(e) => update("players", parseInt(e.target.value) || 1)}
            className="glow-border"
          />
        </div>

        {/* Available Props */}
        <div className="space-y-2">
          <Label className="text-foreground/80">Available Props</Label>
          <Select value={form.props} onValueChange={(v) => update("props", v)}>
            <SelectTrigger className="glow-border">
              <SelectValue placeholder="Select prop availability" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No props</SelectItem>
              <SelectItem value="few">1–3 props</SelectItem>
              <SelectItem value="unlimited">Unlimited props</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Space Available */}
        <div className="space-y-2">
          <Label className="text-foreground/80">Space Available</Label>
          <Input
            value={form.space}
            onChange={(e) => update("space", e.target.value)}
            placeholder="e.g. Small bedroom, Living room, Large indoor hall"
            className="glow-border"
          />
        </div>

        {/* Energy Level */}
        <div className="space-y-2">
          <Label className="text-foreground/80">Energy Level</Label>
          <Select value={form.energy} onValueChange={(v) => update("energy", v)}>
            <SelectTrigger className="glow-border">
              <SelectValue placeholder="Select energy level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="calm">Calm</SelectItem>
              <SelectItem value="moderate">Moderate</SelectItem>
              <SelectItem value="high">High energy</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Time Duration */}
        <div className="space-y-2">
          <Label className="text-foreground/80">Time Duration</Label>
          <Select value={form.duration} onValueChange={(v) => update("duration", v)}>
            <SelectTrigger className="glow-border">
              <SelectValue placeholder="Select duration" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5-10">5–10 minutes</SelectItem>
              <SelectItem value="15-30">15–30 minutes</SelectItem>
              <SelectItem value="30+">30+ minutes</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Learning Goal */}
        <div className="space-y-2">
          <Label className="text-foreground/80">
            Learning Goal <span className="text-muted-foreground">(Optional)</span>
          </Label>
          <Input
            value={form.learningGoal}
            onChange={(e) => update("learningGoal", e.target.value)}
            placeholder="e.g. Motor skills, Teamwork, Focus, Problem-solving"
            className="glow-border"
          />
        </div>

        {/* Game Style */}
        <div className="space-y-2">
          <Label className="text-foreground/80">
            Game Style / Genre <span className="text-primary">*</span>
          </Label>
          <Input
            value={form.gameStyle}
            onChange={(e) => update("gameStyle", e.target.value)}
            placeholder="e.g. Funny, Horror, Adventure, Mystery, Fantasy"
            className="glow-border"
            required
          />
        </div>
      </div>

      <Button
        type="submit"
        variant="glow"
        size="lg"
        className="w-full text-base py-6 rounded-xl"
        disabled={isLoading}
      >
        {isLoading ? (
          <span className="flex items-center gap-2">
            <span className="animate-spin">⟳</span> Generating...
          </span>
        ) : (
          <span className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" /> Generate Game ✨
          </span>
        )}
      </Button>
    </form>
  );
};
