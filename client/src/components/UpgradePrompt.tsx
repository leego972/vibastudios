import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Crown, Lock, Zap } from "lucide-react";
import { useLocation } from "wouter";

interface UpgradePromptProps {
  feature: string;
  requiredTier: "pro" | "industry";
  currentTier?: string;
  compact?: boolean;
}

export function UpgradePrompt({ feature, requiredTier, currentTier = "free", compact = false }: UpgradePromptProps) {
  const [, setLocation] = useLocation();

  if (compact) {
    return (
      <div className="flex items-center gap-2 p-3 rounded-lg border border-amber-500/30 bg-amber-500/5">
        <Lock className="w-4 h-4 text-amber-500 shrink-0" />
        <span className="text-sm text-amber-400">
          {feature} requires <strong className="capitalize">{requiredTier}</strong> plan
        </span>
        <Button
          size="sm"
          variant="outline"
          className="ml-auto border-amber-500/50 text-amber-500 hover:bg-amber-500/10"
          onClick={() => setLocation("/pricing")}
        >
          Upgrade
        </Button>
      </div>
    );
  }

  return (
    <Card className="border-amber-500/30 bg-amber-500/5">
      <CardContent className="flex flex-col items-center justify-center py-12 sm:py-16 text-center px-6">
        <div className="w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center mb-6">
          {requiredTier === "industry" ? (
            <Zap className="w-8 h-8 text-violet-500" />
          ) : (
            <Crown className="w-8 h-8 text-amber-500" />
          )}
        </div>
        <h3 className="text-xl font-bold mb-2">{feature}</h3>
        <p className="text-muted-foreground mb-6 max-w-md">
          This feature is available on the{" "}
          <strong className="capitalize text-foreground">{requiredTier}</strong> plan
          {requiredTier === "pro" ? " ($200/month)" : " ($1,000/month)"}.
          Upgrade to unlock {feature.toLowerCase()} and take your filmmaking to the next level.
        </p>
        <Button
          size="lg"
          className={`${requiredTier === "industry" ? "bg-violet-600 hover:bg-violet-500" : "bg-amber-600 hover:bg-amber-500"} text-white`}
          onClick={() => setLocation("/pricing")}
        >
          <Crown className="w-4 h-4 mr-2" />
          Upgrade to {requiredTier === "industry" ? "Industry" : "Pro"}
        </Button>
        <p className="text-xs text-muted-foreground mt-3">
          You're currently on the <span className="capitalize">{currentTier}</span> plan
        </p>
      </CardContent>
    </Card>
  );
}

/**
 * Hook-style component that wraps children and shows upgrade prompt if feature is locked.
 */
interface FeatureGateProps {
  children: React.ReactNode;
  feature: string;
  requiredTier: "pro" | "industry";
  currentTier?: string;
  hasAccess: boolean;
}

export function FeatureGate({ children, feature, requiredTier, currentTier, hasAccess }: FeatureGateProps) {
  if (hasAccess) return <>{children}</>;
  return <UpgradePrompt feature={feature} requiredTier={requiredTier} currentTier={currentTier} />;
}

/**
 * Small inline badge showing a feature is locked.
 */
export function ProBadge() {
  return (
    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-500/10 text-amber-500 border border-amber-500/20">
      <Crown className="w-2.5 h-2.5" /> PRO
    </span>
  );
}

export function IndustryBadge() {
  return (
    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-violet-500/10 text-violet-500 border border-violet-500/20">
      <Zap className="w-2.5 h-2.5" /> INDUSTRY
    </span>
  );
}
