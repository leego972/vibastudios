import { useState, useRef, useCallback, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";
import {
  Image,
  Wand2,
  Download,
  Save,
  Palette,
  Type,
  Film,
  Sparkles,
  RotateCcw,
  Eye,
  ChevronLeft,
  Layers,
  RectangleHorizontal,
  Square,
  Smartphone,
  Monitor,
  Megaphone,
  Disc3,
  FileText,
  Loader2,
  Plus,
  X,
  Move,
  ZoomIn,
  ZoomOut,
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  Italic,
} from "lucide-react";
import { useLocation } from "wouter";
import { useSubscription } from "@/hooks/useSubscription";
import { FeatureGate } from "@/components/UpgradePrompt";

// ─── Types ───────────────────────────────────────────────────────────────────

type TemplateType = "poster" | "social-square" | "social-story" | "banner" | "billboard" | "dvd-cover" | "press-kit";

type TextElement = {
  id: string;
  text: string;
  x: number;
  y: number;
  fontSize: number;
  fontFamily: string;
  fontWeight: "normal" | "bold";
  fontStyle: "normal" | "italic";
  color: string;
  textAlign: "left" | "center" | "right";
  maxWidth: number;
  opacity: number;
  textTransform: "none" | "uppercase" | "lowercase";
  letterSpacing: number;
};

type PosterState = {
  templateType: TemplateType;
  backgroundImageUrl: string | null;
  backgroundColor: string;
  overlayColor: string;
  overlayOpacity: number;
  textElements: TextElement[];
  selectedElementId: string | null;
};

// ─── Constants ───────────────────────────────────────────────────────────────

const TEMPLATE_CONFIG: Record<TemplateType, { label: string; icon: React.ElementType; width: number; height: number; description: string }> = {
  "poster": { label: "Movie Poster", icon: RectangleHorizontal, width: 675, height: 1000, description: "Classic 27×40 portrait poster" },
  "social-square": { label: "Social (Square)", icon: Square, width: 800, height: 800, description: "Instagram post, Facebook ad" },
  "social-story": { label: "Social (Story)", icon: Smartphone, width: 540, height: 960, description: "Instagram/TikTok story, Reels" },
  "banner": { label: "Banner", icon: Monitor, width: 1280, height: 720, description: "YouTube thumbnail, website header" },
  "billboard": { label: "Billboard", icon: Megaphone, width: 1200, height: 400, description: "Ultra-wide outdoor advertising" },
  "dvd-cover": { label: "DVD/Blu-ray", icon: Disc3, width: 780, height: 1050, description: "Front cover with spine area" },
  "press-kit": { label: "Press Kit", icon: FileText, width: 900, height: 1200, description: "Professional media press layout" },
};

const FONT_FAMILIES = [
  "Inter", "Georgia", "Courier New", "Impact", "Arial Black",
  "Trebuchet MS", "Palatino", "Garamond", "Verdana", "Tahoma",
];

const COLOR_PRESETS = [
  { name: "Classic Black", bg: "#000000", overlay: "rgba(0,0,0,0.6)", text: "#ffffff" },
  { name: "Midnight Blue", bg: "#0a1628", overlay: "rgba(10,22,40,0.7)", text: "#e0e8f0" },
  { name: "Crimson Dark", bg: "#1a0000", overlay: "rgba(139,0,0,0.5)", text: "#ff4444" },
  { name: "Golden Hour", bg: "#1a1000", overlay: "rgba(180,120,0,0.4)", text: "#ffd700" },
  { name: "Emerald Night", bg: "#001a0a", overlay: "rgba(0,100,50,0.5)", text: "#00ff88" },
  { name: "Royal Purple", bg: "#0f001a", overlay: "rgba(80,0,120,0.5)", text: "#bb88ff" },
  { name: "Arctic White", bg: "#f0f4f8", overlay: "rgba(255,255,255,0.7)", text: "#111827" },
  { name: "Sunset", bg: "#1a0a00", overlay: "rgba(200,80,0,0.4)", text: "#ff8844" },
];

function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

function getDefaultTextElements(templateType: TemplateType): TextElement[] {
  const config = TEMPLATE_CONFIG[templateType];
  const w = config.width;
  const h = config.height;

  const base: TextElement[] = [
    {
      id: generateId(),
      text: "MOVIE TITLE",
      x: w / 2,
      y: h * 0.45,
      fontSize: templateType === "billboard" ? 48 : 42,
      fontFamily: "Inter",
      fontWeight: "bold",
      fontStyle: "normal",
      color: "#ffffff",
      textAlign: "center",
      maxWidth: w * 0.85,
      opacity: 1,
      textTransform: "uppercase",
      letterSpacing: 4,
    },
    {
      id: generateId(),
      text: "A story that will change everything",
      x: w / 2,
      y: h * 0.55,
      fontSize: templateType === "billboard" ? 20 : 18,
      fontFamily: "Georgia",
      fontWeight: "normal",
      fontStyle: "italic",
      color: "#cccccc",
      textAlign: "center",
      maxWidth: w * 0.75,
      opacity: 0.9,
      textTransform: "none",
      letterSpacing: 1,
    },
  ];

  if (templateType === "poster" || templateType === "dvd-cover" || templateType === "press-kit") {
    base.push(
      {
        id: generateId(),
        text: "COMING SOON",
        x: w / 2,
        y: h * 0.88,
        fontSize: 14,
        fontFamily: "Inter",
        fontWeight: "bold",
        fontStyle: "normal",
        color: "#888888",
        textAlign: "center",
        maxWidth: w * 0.8,
        opacity: 0.8,
        textTransform: "uppercase",
        letterSpacing: 6,
      },
      {
        id: generateId(),
        text: "Directed by • Produced by • Starring",
        x: w / 2,
        y: h * 0.93,
        fontSize: 10,
        fontFamily: "Inter",
        fontWeight: "normal",
        fontStyle: "normal",
        color: "#666666",
        textAlign: "center",
        maxWidth: w * 0.9,
        opacity: 0.7,
        textTransform: "none",
        letterSpacing: 1,
      }
    );
  }

  if (templateType === "banner") {
    base[0].x = w * 0.35;
    base[0].y = h * 0.4;
    base[1].x = w * 0.35;
    base[1].y = h * 0.55;
  }

  return base;
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function AdPosterMaker() {
  const [, setLocation] = useLocation();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const { canUseFeature, tier, isLoading: subLoading } = useSubscription();

  // Project selection
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const { data: projects } = trpc.project.list.useQuery();
  const { data: projectDetail } = trpc.project.get.useQuery(
    { id: selectedProjectId! },
    { enabled: !!selectedProjectId }
  );

  // Poster state
  const [poster, setPoster] = useState<PosterState>({
    templateType: "poster",
    backgroundImageUrl: null,
    backgroundColor: "#000000",
    overlayColor: "rgba(0,0,0,0.6)",
    overlayOpacity: 0.6,
    textElements: getDefaultTextElements("poster"),
    selectedElementId: null,
  });

  // UI state
  const [activeTab, setActiveTab] = useState("template");
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [isGeneratingCopy, setIsGeneratingCopy] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [exportScale, setExportScale] = useState(2);
  const [zoom, setZoom] = useState(1);
  const [draggingElement, setDraggingElement] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // AI mutations
  const generateImageMutation = trpc.poster.generateImage.useMutation({
    onSuccess: (data) => {
      if (data.url) {
        setPoster((p) => ({ ...p, backgroundImageUrl: data.url! }));
        toast.success("Poster artwork generated!");
      }
    },
    onError: (err) => toast.error(`Image generation failed: ${err.message}`),
    onSettled: () => setIsGeneratingImage(false),
  });

  const generateCopyMutation = trpc.poster.generateCopy.useMutation({
    onSuccess: (data) => {
      if (data.title || data.tagline || data.credits) {
        setPoster((p) => {
          const elements = [...p.textElements];
          if (data.title && elements[0]) elements[0] = { ...elements[0], text: data.title };
          if (data.tagline && elements[1]) elements[1] = { ...elements[1], text: data.tagline };
          if (data.credits && elements[3]) elements[3] = { ...elements[3], text: data.credits };
          return { ...p, textElements: elements };
        });
        toast.success("Marketing copy generated!");
      }
    },
    onError: (err) => toast.error(`Copy generation failed: ${err.message}`),
    onSettled: () => setIsGeneratingCopy(false),
  });

  // Template change
  const handleTemplateChange = (type: TemplateType) => {
    setPoster((p) => ({
      ...p,
      templateType: type,
      textElements: getDefaultTextElements(type),
      selectedElementId: null,
    }));
  };

  // Apply project data
  useEffect(() => {
    if (projectDetail) {
      setPoster((p) => {
        const elements = [...p.textElements];
        if (elements[0]) elements[0] = { ...elements[0], text: projectDetail.title.toUpperCase() };
        if (projectDetail.plotSummary && elements[1]) {
          const tagline = projectDetail.plotSummary.length > 60
            ? projectDetail.plotSummary.substring(0, 57) + "..."
            : projectDetail.plotSummary;
          elements[1] = { ...elements[1], text: tagline };
        }
        return { ...p, textElements: elements };
      });
    }
  }, [projectDetail]);

  // Text element operations
  const updateTextElement = (id: string, updates: Partial<TextElement>) => {
    setPoster((p) => ({
      ...p,
      textElements: p.textElements.map((el) => (el.id === id ? { ...el, ...updates } : el)),
    }));
  };

  const addTextElement = () => {
    const config = TEMPLATE_CONFIG[poster.templateType];
    const newEl: TextElement = {
      id: generateId(),
      text: "New Text",
      x: config.width / 2,
      y: config.height / 2,
      fontSize: 20,
      fontFamily: "Inter",
      fontWeight: "normal",
      fontStyle: "normal",
      color: "#ffffff",
      textAlign: "center",
      maxWidth: config.width * 0.6,
      opacity: 1,
      textTransform: "none",
      letterSpacing: 0,
    };
    setPoster((p) => ({
      ...p,
      textElements: [...p.textElements, newEl],
      selectedElementId: newEl.id,
    }));
  };

  const removeTextElement = (id: string) => {
    setPoster((p) => ({
      ...p,
      textElements: p.textElements.filter((el) => el.id !== id),
      selectedElementId: p.selectedElementId === id ? null : p.selectedElementId,
    }));
  };

  // AI generation
  const handleGenerateImage = () => {
    setIsGeneratingImage(true);
    const title = poster.textElements[0]?.text || "Movie";
    const tagline = poster.textElements[1]?.text || "";
    const genre = projectDetail?.genre || "drama";
    const description = projectDetail?.plotSummary || projectDetail?.description || "";
    const templateLabel = TEMPLATE_CONFIG[poster.templateType].label;

    generateImageMutation.mutate({
      prompt: `Create a cinematic ${templateLabel.toLowerCase()} background image for a ${genre} film called "${title}". ${tagline}. ${description}. Professional movie poster photography, dramatic lighting, high quality, no text or lettering.`,
      templateType: poster.templateType,
    });
  };

  const handleGenerateCopy = () => {
    setIsGeneratingCopy(true);
    const genre = projectDetail?.genre || "drama";
    const description = projectDetail?.plotSummary || projectDetail?.description || "";
    const title = projectDetail?.title || poster.textElements[0]?.text || "";

    generateCopyMutation.mutate({
      title,
      genre,
      description,
      templateType: poster.templateType,
    });
  };

  // Canvas drag handlers
  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const config = TEMPLATE_CONFIG[poster.templateType];
    const scaleX = config.width / rect.width;
    const scaleY = config.height / rect.height;
    const mx = (e.clientX - rect.left) * scaleX;
    const my = (e.clientY - rect.top) * scaleY;

    // Check if clicking on a text element (reverse order for z-index)
    for (let i = poster.textElements.length - 1; i >= 0; i--) {
      const el = poster.textElements[i];
      const halfW = el.maxWidth / 2;
      const halfH = el.fontSize * 2;
      if (mx >= el.x - halfW && mx <= el.x + halfW && my >= el.y - halfH && my <= el.y + halfH) {
        setPoster((p) => ({ ...p, selectedElementId: el.id }));
        setDraggingElement(el.id);
        setDragOffset({ x: mx - el.x, y: my - el.y });
        return;
      }
    }
    setPoster((p) => ({ ...p, selectedElementId: null }));
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!draggingElement) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const config = TEMPLATE_CONFIG[poster.templateType];
    const scaleX = config.width / rect.width;
    const scaleY = config.height / rect.height;
    const mx = (e.clientX - rect.left) * scaleX;
    const my = (e.clientY - rect.top) * scaleY;
    updateTextElement(draggingElement, {
      x: mx - dragOffset.x,
      y: my - dragOffset.y,
    });
  };

  const handleCanvasMouseUp = () => {
    setDraggingElement(null);
  };

  // Export
  const handleExport = useCallback(async () => {
    const config = TEMPLATE_CONFIG[poster.templateType];
    const canvas = document.createElement("canvas");
    const w = config.width * exportScale;
    const h = config.height * exportScale;
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d")!;
    const scale = exportScale;

    // Background
    ctx.fillStyle = poster.backgroundColor;
    ctx.fillRect(0, 0, w, h);

    // Background image
    if (poster.backgroundImageUrl) {
      try {
        const img = new window.Image();
        img.crossOrigin = "anonymous";
        await new Promise<void>((resolve, reject) => {
          img.onload = () => resolve();
          img.onerror = reject;
          img.src = poster.backgroundImageUrl!;
        });
        // Cover fit
        const imgRatio = img.width / img.height;
        const canvasRatio = w / h;
        let sw = img.width, sh = img.height, sx = 0, sy = 0;
        if (imgRatio > canvasRatio) {
          sw = img.height * canvasRatio;
          sx = (img.width - sw) / 2;
        } else {
          sh = img.width / canvasRatio;
          sy = (img.height - sh) / 2;
        }
        ctx.drawImage(img, sx, sy, sw, sh, 0, 0, w, h);
      } catch {
        // Failed to load image, continue with solid background
      }
    }

    // Overlay
    ctx.fillStyle = poster.overlayColor;
    ctx.globalAlpha = poster.overlayOpacity;
    ctx.fillRect(0, 0, w, h);
    ctx.globalAlpha = 1;

    // Text elements
    for (const el of poster.textElements) {
      ctx.save();
      ctx.globalAlpha = el.opacity;
      ctx.fillStyle = el.color;
      const fontStyle = el.fontStyle === "italic" ? "italic " : "";
      const fontWeight = el.fontWeight === "bold" ? "bold " : "";
      ctx.font = `${fontStyle}${fontWeight}${el.fontSize * scale}px ${el.fontFamily}`;
      ctx.textAlign = el.textAlign;
      ctx.textBaseline = "middle";

      let displayText = el.text;
      if (el.textTransform === "uppercase") displayText = displayText.toUpperCase();
      if (el.textTransform === "lowercase") displayText = displayText.toLowerCase();

      if (el.letterSpacing > 0) {
        ctx.letterSpacing = `${el.letterSpacing * scale}px`;
      }

      // Word wrap
      const maxW = el.maxWidth * scale;
      const words = displayText.split(" ");
      const lines: string[] = [];
      let currentLine = "";
      for (const word of words) {
        const testLine = currentLine ? `${currentLine} ${word}` : word;
        if (ctx.measureText(testLine).width > maxW && currentLine) {
          lines.push(currentLine);
          currentLine = word;
        } else {
          currentLine = testLine;
        }
      }
      if (currentLine) lines.push(currentLine);

      const lineHeight = el.fontSize * scale * 1.3;
      const totalHeight = lines.length * lineHeight;
      const startY = el.y * scale - totalHeight / 2 + lineHeight / 2;

      for (let i = 0; i < lines.length; i++) {
        ctx.fillText(lines[i], el.x * scale, startY + i * lineHeight);
      }
      ctx.restore();
    }

    // Download
    const link = document.createElement("a");
    link.download = `${poster.textElements[0]?.text || "poster"}_${poster.templateType}_${config.width * exportScale}x${config.height * exportScale}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
    toast.success("Poster exported!");
    setShowExportDialog(false);
  }, [poster, exportScale]);

  const selectedElement = poster.textElements.find((el) => el.id === poster.selectedElementId);
  const config = TEMPLATE_CONFIG[poster.templateType];

  if (!canUseFeature("canUseAdPosterMaker")) {
    return (
      <div className="p-4 sm:p-6">
        <FeatureGate feature="Ad & Poster Maker" requiredTier="pro" currentTier={tier} hasAccess={false}>
          <div />
        </FeatureGate>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Button variant="ghost" size="sm" className="gap-1 -ml-2 text-muted-foreground hover:text-foreground" onClick={() => setLocation("/")}>
              <ChevronLeft className="h-4 w-4" />
              Dashboard
            </Button>
          </div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Megaphone className="h-6 w-6 text-primary" />
            Ad & Poster Maker
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Create professional advertising material for your films
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="outline" className="gap-2" onClick={handleGenerateImage} disabled={isGeneratingImage}>
            {isGeneratingImage ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
            AI Artwork
          </Button>
          <Button variant="outline" className="gap-2" onClick={handleGenerateCopy} disabled={isGeneratingCopy}>
            {isGeneratingCopy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            AI Copy
          </Button>
          <Button className="gap-2" onClick={() => setShowExportDialog(true)}>
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Main Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6">
        {/* Canvas Preview */}
        <div className="space-y-3">
          {/* Zoom Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {config.label} — {config.width}×{config.height}
              </Badge>
              {selectedProjectId && projectDetail && (
                <Badge className="bg-primary/10 text-primary border-primary/20 text-xs">
                  <Film className="h-3 w-3 mr-1" />
                  {projectDetail.title}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-1">
              <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setZoom((z) => Math.max(0.25, z - 0.25))}>
                <ZoomOut className="h-3.5 w-3.5" />
              </Button>
              <span className="text-xs text-muted-foreground w-12 text-center">{Math.round(zoom * 100)}%</span>
              <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setZoom((z) => Math.min(2, z + 0.25))}>
                <ZoomIn className="h-3.5 w-3.5" />
              </Button>
              <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setZoom(1)}>
                <RotateCcw className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>

          {/* Canvas */}
          <div className="border rounded-lg bg-muted/30 overflow-auto flex items-center justify-center p-4" style={{ minHeight: "500px" }}>
            <div
              ref={previewRef}
              className="relative shadow-2xl cursor-crosshair select-none"
              style={{
                width: config.width * zoom,
                height: config.height * zoom,
                backgroundColor: poster.backgroundColor,
                backgroundImage: poster.backgroundImageUrl ? `url(${poster.backgroundImageUrl})` : undefined,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
              onMouseDown={handleCanvasMouseDown}
              onMouseMove={handleCanvasMouseMove}
              onMouseUp={handleCanvasMouseUp}
              onMouseLeave={handleCanvasMouseUp}
            >
              {/* Overlay */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{ backgroundColor: poster.overlayColor, opacity: poster.overlayOpacity }}
              />

              {/* Text Elements */}
              {poster.textElements.map((el) => {
                const isSelected = el.id === poster.selectedElementId;
                let displayText = el.text;
                if (el.textTransform === "uppercase") displayText = displayText.toUpperCase();
                if (el.textTransform === "lowercase") displayText = displayText.toLowerCase();

                return (
                  <div
                    key={el.id}
                    className={`absolute pointer-events-none ${isSelected ? "ring-2 ring-primary ring-offset-1" : ""}`}
                    style={{
                      left: el.x * zoom,
                      top: el.y * zoom,
                      transform: "translate(-50%, -50%)",
                      maxWidth: el.maxWidth * zoom,
                      fontSize: el.fontSize * zoom,
                      fontFamily: el.fontFamily,
                      fontWeight: el.fontWeight,
                      fontStyle: el.fontStyle,
                      color: el.color,
                      textAlign: el.textAlign,
                      opacity: el.opacity,
                      letterSpacing: el.letterSpacing * zoom,
                      lineHeight: 1.3,
                      whiteSpace: "pre-wrap",
                      wordBreak: "break-word",
                    }}
                  >
                    {displayText}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Controls Panel */}
        <div className="space-y-4">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full flex flex-wrap h-auto">
              <TabsTrigger value="template" className="flex-1 text-xs gap-1"><Layers className="h-3 w-3" /> Template</TabsTrigger>
              <TabsTrigger value="text" className="flex-1 text-xs gap-1"><Type className="h-3 w-3" /> Text</TabsTrigger>
              <TabsTrigger value="style" className="flex-1 text-xs gap-1"><Palette className="h-3 w-3" /> Style</TabsTrigger>
            </TabsList>

            {/* Template Tab */}
            <TabsContent value="template" className="space-y-4 mt-4">
              {/* Project Selector */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Link to Project</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Select
                    value={selectedProjectId?.toString() || "none"}
                    onValueChange={(v) => setSelectedProjectId(v === "none" ? null : Number(v))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a project..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No project</SelectItem>
                      {projects?.map((p) => (
                        <SelectItem key={p.id} value={p.id.toString()}>
                          {p.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Link a project to auto-fill title, genre, and description
                  </p>
                </CardContent>
              </Card>

              {/* Template Types */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Template Type</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 gap-2">
                    {(Object.entries(TEMPLATE_CONFIG) as [TemplateType, typeof TEMPLATE_CONFIG[TemplateType]][]).map(([type, cfg]) => (
                      <button
                        key={type}
                        className={`flex items-center gap-3 p-2.5 rounded-lg border text-left transition-all ${poster.templateType === type ? "border-primary bg-primary/5 ring-1 ring-primary/30" : "border-border hover:border-primary/30 hover:bg-muted/50"}`}
                        onClick={() => handleTemplateChange(type)}
                      >
                        <cfg.icon className={`h-4 w-4 shrink-0 ${poster.templateType === type ? "text-primary" : "text-muted-foreground"}`} />
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">{cfg.label}</p>
                          <p className="text-xs text-muted-foreground">{cfg.description}</p>
                        </div>
                        <Badge variant="outline" className="text-[10px] shrink-0 ml-auto">
                          {cfg.width}×{cfg.height}
                        </Badge>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Text Tab */}
            <TabsContent value="text" className="space-y-4 mt-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium">Text Layers</h3>
                <Button size="sm" variant="outline" className="gap-1 h-7 text-xs" onClick={addTextElement}>
                  <Plus className="h-3 w-3" />
                  Add Text
                </Button>
              </div>

              {/* Text element list */}
              <div className="space-y-2">
                {poster.textElements.map((el, i) => (
                  <button
                    key={el.id}
                    className={`w-full flex items-center gap-2 p-2 rounded-lg border text-left transition-all ${poster.selectedElementId === el.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"}`}
                    onClick={() => setPoster((p) => ({ ...p, selectedElementId: el.id }))}
                  >
                    <Type className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    <span className="text-xs truncate flex-1">{el.text}</span>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-6 w-6 shrink-0 text-destructive/60 hover:text-destructive"
                      onClick={(e) => { e.stopPropagation(); removeTextElement(el.id); }}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </button>
                ))}
              </div>

              {/* Selected element editor */}
              {selectedElement && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Edit Text</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <Label className="text-xs">Content</Label>
                      <Textarea
                        value={selectedElement.text}
                        onChange={(e) => updateTextElement(selectedElement.id, { text: e.target.value })}
                        rows={2}
                        className="text-sm"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label className="text-xs">Font</Label>
                        <Select
                          value={selectedElement.fontFamily}
                          onValueChange={(v) => updateTextElement(selectedElement.id, { fontFamily: v })}
                        >
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {FONT_FAMILIES.map((f) => (
                              <SelectItem key={f} value={f} className="text-xs">{f}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-xs">Size</Label>
                        <Input
                          type="number"
                          value={selectedElement.fontSize}
                          onChange={(e) => updateTextElement(selectedElement.id, { fontSize: Number(e.target.value) })}
                          className="h-8 text-xs"
                          min={8}
                          max={120}
                        />
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs">Color</Label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={selectedElement.color}
                          onChange={(e) => updateTextElement(selectedElement.id, { color: e.target.value })}
                          className="h-8 w-8 rounded border cursor-pointer"
                        />
                        <Input
                          value={selectedElement.color}
                          onChange={(e) => updateTextElement(selectedElement.id, { color: e.target.value })}
                          className="h-8 text-xs flex-1"
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        size="icon"
                        variant={selectedElement.fontWeight === "bold" ? "secondary" : "ghost"}
                        className="h-7 w-7"
                        onClick={() => updateTextElement(selectedElement.id, { fontWeight: selectedElement.fontWeight === "bold" ? "normal" : "bold" })}
                      >
                        <Bold className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        size="icon"
                        variant={selectedElement.fontStyle === "italic" ? "secondary" : "ghost"}
                        className="h-7 w-7"
                        onClick={() => updateTextElement(selectedElement.id, { fontStyle: selectedElement.fontStyle === "italic" ? "normal" : "italic" })}
                      >
                        <Italic className="h-3.5 w-3.5" />
                      </Button>
                      <div className="w-px h-5 bg-border mx-1" />
                      <Button
                        size="icon"
                        variant={selectedElement.textAlign === "left" ? "secondary" : "ghost"}
                        className="h-7 w-7"
                        onClick={() => updateTextElement(selectedElement.id, { textAlign: "left" })}
                      >
                        <AlignLeft className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        size="icon"
                        variant={selectedElement.textAlign === "center" ? "secondary" : "ghost"}
                        className="h-7 w-7"
                        onClick={() => updateTextElement(selectedElement.id, { textAlign: "center" })}
                      >
                        <AlignCenter className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        size="icon"
                        variant={selectedElement.textAlign === "right" ? "secondary" : "ghost"}
                        className="h-7 w-7"
                        onClick={() => updateTextElement(selectedElement.id, { textAlign: "right" })}
                      >
                        <AlignRight className="h-3.5 w-3.5" />
                      </Button>
                      <div className="w-px h-5 bg-border mx-1" />
                      <Select
                        value={selectedElement.textTransform}
                        onValueChange={(v) => updateTextElement(selectedElement.id, { textTransform: v as TextElement["textTransform"] })}
                      >
                        <SelectTrigger className="h-7 text-xs w-20">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none" className="text-xs">Normal</SelectItem>
                          <SelectItem value="uppercase" className="text-xs">UPPER</SelectItem>
                          <SelectItem value="lowercase" className="text-xs">lower</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-xs">Letter Spacing: {selectedElement.letterSpacing}px</Label>
                      <Slider
                        value={[selectedElement.letterSpacing]}
                        min={0}
                        max={20}
                        step={0.5}
                        onValueChange={([v]) => updateTextElement(selectedElement.id, { letterSpacing: v })}
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Opacity: {Math.round(selectedElement.opacity * 100)}%</Label>
                      <Slider
                        value={[selectedElement.opacity]}
                        min={0}
                        max={1}
                        step={0.05}
                        onValueChange={([v]) => updateTextElement(selectedElement.id, { opacity: v })}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label className="text-xs">X Position</Label>
                        <Input
                          type="number"
                          value={Math.round(selectedElement.x)}
                          onChange={(e) => updateTextElement(selectedElement.id, { x: Number(e.target.value) })}
                          className="h-8 text-xs"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Y Position</Label>
                        <Input
                          type="number"
                          value={Math.round(selectedElement.y)}
                          onChange={(e) => updateTextElement(selectedElement.id, { y: Number(e.target.value) })}
                          className="h-8 text-xs"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Style Tab */}
            <TabsContent value="style" className="space-y-4 mt-4">
              {/* Color Presets */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Color Themes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-2">
                    {COLOR_PRESETS.map((preset) => (
                      <button
                        key={preset.name}
                        className="flex items-center gap-2 p-2 rounded-lg border hover:border-primary/30 transition-all text-left"
                        onClick={() => {
                          setPoster((p) => ({
                            ...p,
                            backgroundColor: preset.bg,
                            overlayColor: preset.overlay,
                          }));
                          // Update text colors
                          setPoster((p) => ({
                            ...p,
                            textElements: p.textElements.map((el, i) => ({
                              ...el,
                              color: i === 0 ? preset.text : i === 1 ? preset.text + "cc" : preset.text + "88",
                            })),
                          }));
                        }}
                      >
                        <div className="w-6 h-6 rounded-full border shrink-0" style={{ backgroundColor: preset.bg, boxShadow: `inset 0 0 0 2px ${preset.text}40` }} />
                        <span className="text-xs truncate">{preset.name}</span>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Custom Colors */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Custom Colors</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <Label className="text-xs">Background Color</Label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={poster.backgroundColor}
                        onChange={(e) => setPoster((p) => ({ ...p, backgroundColor: e.target.value }))}
                        className="h-8 w-8 rounded border cursor-pointer"
                      />
                      <Input
                        value={poster.backgroundColor}
                        onChange={(e) => setPoster((p) => ({ ...p, backgroundColor: e.target.value }))}
                        className="h-8 text-xs flex-1"
                      />
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs">Overlay Opacity: {Math.round(poster.overlayOpacity * 100)}%</Label>
                    <Slider
                      value={[poster.overlayOpacity]}
                      min={0}
                      max={1}
                      step={0.05}
                      onValueChange={([v]) => setPoster((p) => ({ ...p, overlayOpacity: v }))}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Background Image */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Background Image</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div>
                    <Label className="text-xs">Image URL</Label>
                    <Input
                      value={poster.backgroundImageUrl || ""}
                      onChange={(e) => setPoster((p) => ({ ...p, backgroundImageUrl: e.target.value || null }))}
                      placeholder="Paste image URL or use AI Artwork..."
                      className="text-xs"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="gap-1 text-xs flex-1" onClick={handleGenerateImage} disabled={isGeneratingImage}>
                      {isGeneratingImage ? <Loader2 className="h-3 w-3 animate-spin" /> : <Wand2 className="h-3 w-3" />}
                      Generate with AI
                    </Button>
                    {poster.backgroundImageUrl && (
                      <Button size="sm" variant="ghost" className="text-xs text-destructive" onClick={() => setPoster((p) => ({ ...p, backgroundImageUrl: null }))}>
                        Remove
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Export Dialog */}
      <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Export Poster</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Export Scale</Label>
              <Select value={exportScale.toString()} onValueChange={(v) => setExportScale(Number(v))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1x ({config.width}×{config.height})</SelectItem>
                  <SelectItem value="2">2x ({config.width * 2}×{config.height * 2}) — Recommended</SelectItem>
                  <SelectItem value="3">3x ({config.width * 3}×{config.height * 3}) — Print Quality</SelectItem>
                  <SelectItem value="4">4x ({config.width * 4}×{config.height * 4}) — Ultra HD</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="text-sm text-muted-foreground">
              Output: <strong>{config.width * exportScale}×{config.height * exportScale}px</strong> PNG
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowExportDialog(false)}>Cancel</Button>
            <Button className="gap-2" onClick={handleExport}>
              <Download className="h-4 w-4" />
              Download PNG
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
