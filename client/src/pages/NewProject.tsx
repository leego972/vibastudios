import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Zap, Layers, Loader2 } from "lucide-react";
import { useLocation, useSearch } from "wouter";
import { useState } from "react";
import { toast } from "sonner";
import {
  RATING_OPTIONS,
  QUALITY_OPTIONS,
  GENRE_OPTIONS,
} from "@shared/types";

export default function NewProject() {
  const [, setLocation] = useLocation();
  const searchString = useSearch();
  const params = new URLSearchParams(searchString);
  const initialMode = params.get("mode") === "manual" ? "manual" : "quick";

  const [mode, setMode] = useState<"quick" | "manual">(initialMode as "quick" | "manual");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [genre, setGenre] = useState("");
  const [rating, setRating] = useState<string>("PG-13");
  const [duration, setDuration] = useState<number>(90);
  const [plotSummary, setPlotSummary] = useState("");
  const [resolution, setResolution] = useState("1920x1080");
  const [quality, setQuality] = useState<string>("high");

  const createMutation = trpc.project.create.useMutation({
    onSuccess: (project) => {
      toast.success("Project created");
      if (mode === "manual") {
        setLocation(`/projects/${project.id}/scenes`);
      } else {
        setLocation(`/projects/${project.id}`);
      }
    },
    onError: (err) => toast.error(err.message),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Please enter a project title");
      return;
    }
    createMutation.mutate({
      title: title.trim(),
      description: description.trim() || undefined,
      mode,
      genre: genre || undefined,
      rating: rating as any,
      duration: duration || undefined,
      plotSummary: plotSummary.trim() || undefined,
      resolution,
      quality: quality as any,
    });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => setLocation("/projects")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">New Project</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Set up your film production
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Production Mode */}
        <div className="space-y-2">
          <Label className="text-sm">Production Mode</Label>
          <div className="grid grid-cols-2 gap-3">
            <Card
              className={`cursor-pointer transition-colors ${
                mode === "quick"
                  ? "border-primary bg-primary/5"
                  : "bg-card/50 hover:border-muted-foreground/30"
              }`}
              onClick={() => setMode("quick")}
            >
              <CardContent className="p-4 flex items-start gap-3">
                <Zap className={`h-5 w-5 mt-0.5 shrink-0 ${mode === "quick" ? "text-primary" : "text-muted-foreground"}`} />
                <div>
                  <p className="text-sm font-medium">Quick Generate</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    AI creates your entire film from a plot description
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card
              className={`cursor-pointer transition-colors ${
                mode === "manual"
                  ? "border-primary bg-primary/5"
                  : "bg-card/50 hover:border-muted-foreground/30"
              }`}
              onClick={() => setMode("manual")}
            >
              <CardContent className="p-4 flex items-start gap-3">
                <Layers className={`h-5 w-5 mt-0.5 shrink-0 ${mode === "manual" ? "text-primary" : "text-muted-foreground"}`} />
                <div>
                  <p className="text-sm font-medium">Scene-by-Scene</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Craft each scene with full creative control
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Basic Info */}
        <Card className="bg-card/50">
          <CardHeader className="pb-4">
            <CardTitle className="text-sm font-medium">Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="title" className="text-xs text-muted-foreground">
                Project Title <span className="text-destructive">*</span>
              </Label>
              <Input
                id="title"
                placeholder="e.g. The Last Horizon"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="bg-background/50 h-9 text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="description" className="text-xs text-muted-foreground">
                Short Description
              </Label>
              <Input
                id="description"
                placeholder="A brief tagline or logline for your film"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="bg-background/50 h-9 text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Genre</Label>
                <Select value={genre} onValueChange={setGenre}>
                  <SelectTrigger className="bg-background/50 h-9 text-sm">
                    <SelectValue placeholder="Select genre" />
                  </SelectTrigger>
                  <SelectContent>
                    {GENRE_OPTIONS.map((g) => (
                      <SelectItem key={g} value={g}>
                        {g}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Rating</Label>
                <Select value={rating} onValueChange={setRating}>
                  <SelectTrigger className="bg-background/50 h-9 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {RATING_OPTIONS.map((r) => (
                      <SelectItem key={r} value={r}>
                        {r}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="duration" className="text-xs text-muted-foreground">
                  Duration (minutes)
                </Label>
                <Input
                  id="duration"
                  type="number"
                  min={1}
                  max={300}
                  value={duration}
                  onChange={(e) => setDuration(parseInt(e.target.value) || 90)}
                  className="bg-background/50 h-9 text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Resolution</Label>
                <Select value={resolution} onValueChange={setResolution}>
                  <SelectTrigger className="bg-background/50 h-9 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1280x720">720p (HD)</SelectItem>
                    <SelectItem value="1920x1080">1080p (Full HD)</SelectItem>
                    <SelectItem value="2560x1440">1440p (2K)</SelectItem>
                    <SelectItem value="3840x2160">2160p (4K)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Quality</Label>
              <Select value={quality} onValueChange={setQuality}>
                <SelectTrigger className="bg-background/50 h-9 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {QUALITY_OPTIONS.map((q) => (
                    <SelectItem key={q} value={q}>
                      {q.charAt(0).toUpperCase() + q.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Plot */}
        <Card className="bg-card/50">
          <CardHeader className="pb-4">
            <CardTitle className="text-sm font-medium">Story & Plot</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1.5">
              <Label htmlFor="plot" className="text-xs text-muted-foreground">
                Plot Summary
              </Label>
              <Textarea
                id="plot"
                placeholder="Describe the full plot of your film. Include the main conflict, character arcs, key turning points, and resolution. The more detail you provide, the better the AI can generate your scenes..."
                value={plotSummary}
                onChange={(e) => setPlotSummary(e.target.value)}
                className="bg-background/50 min-h-[160px] text-sm resize-y"
              />
              <p className="text-xs text-muted-foreground">
                {mode === "quick"
                  ? "AI will use this to automatically generate all scenes for your film."
                  : "This provides context for AI-assisted scene generation."}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setLocation("/projects")}
          >
            Cancel
          </Button>
          <Button type="submit" size="sm" disabled={createMutation.isPending}>
            {createMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                Creating...
              </>
            ) : (
              <>Create Project</>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
