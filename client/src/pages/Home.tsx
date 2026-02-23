import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Film,
  Plus,
  Zap,
  Layers,
  Users,
  ArrowRight,
  Clock,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { useLocation } from "wouter";

export default function Home() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { data: projects, isLoading } = trpc.project.list.useQuery();

  const recentProjects = projects?.slice(0, 4) || [];
  const stats = {
    total: projects?.length || 0,
    generating: projects?.filter((p) => p.status === "generating").length || 0,
    completed: projects?.filter((p) => p.status === "completed").length || 0,
    draft: projects?.filter((p) => p.status === "draft").length || 0,
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Welcome back{user?.name ? `, ${user.name}` : ""}
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Create and manage your film productions
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card
          className="group cursor-pointer border-dashed hover:border-primary/40 transition-colors bg-card/50"
          onClick={() => setLocation("/projects/new?mode=quick")}
        >
          <CardContent className="p-5 flex items-start gap-4">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <Zap className="h-5 w-5 text-primary" />
            </div>
            <div className="min-w-0">
              <h3 className="font-medium text-sm">Quick Generate</h3>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                Upload characters, describe your plot, and let AI create your film
              </p>
            </div>
          </CardContent>
        </Card>

        <Card
          className="group cursor-pointer border-dashed hover:border-primary/40 transition-colors bg-card/50"
          onClick={() => setLocation("/projects/new?mode=manual")}
        >
          <CardContent className="p-5 flex items-start gap-4">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <Layers className="h-5 w-5 text-primary" />
            </div>
            <div className="min-w-0">
              <h3 className="font-medium text-sm">Scene-by-Scene</h3>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                Craft each scene manually with full creative control
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total Projects", value: stats.total, icon: Film },
          { label: "In Production", value: stats.generating, icon: Loader2 },
          { label: "Completed", value: stats.completed, icon: CheckCircle2 },
          { label: "Drafts", value: stats.draft, icon: Clock },
        ].map((stat) => (
          <Card key={stat.label} className="bg-card/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-2">
                <stat.icon className="h-3.5 w-3.5" />
                <span className="text-xs">{stat.label}</span>
              </div>
              {isLoading ? (
                <Skeleton className="h-7 w-12" />
              ) : (
                <p className="text-2xl font-semibold">{stat.value}</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Projects */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium">Recent Projects</h2>
          {(projects?.length || 0) > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-muted-foreground"
              onClick={() => setLocation("/projects")}
            >
              View all
              <ArrowRight className="h-3 w-3 ml-1" />
            </Button>
          )}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="bg-card/50">
                <CardContent className="p-4">
                  <Skeleton className="h-32 w-full rounded-md mb-3" />
                  <Skeleton className="h-4 w-3/4 mb-2" />
                  <Skeleton className="h-3 w-1/2" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : recentProjects.length === 0 ? (
          <Card className="bg-card/50 border-dashed">
            <CardContent className="p-12 flex flex-col items-center text-center">
              <Film className="h-10 w-10 text-muted-foreground/40 mb-3" />
              <p className="text-sm text-muted-foreground mb-4">
                No projects yet. Start your first production.
              </p>
              <Button size="sm" onClick={() => setLocation("/projects/new")}>
                <Plus className="h-4 w-4 mr-1" />
                New Project
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {recentProjects.map((project) => (
              <Card
                key={project.id}
                className="bg-card/50 cursor-pointer hover:border-primary/30 transition-colors"
                onClick={() => setLocation(`/projects/${project.id}`)}
              >
                <CardContent className="p-4">
                  {project.thumbnailUrl ? (
                    <div className="aspect-video rounded-md overflow-hidden mb-3 bg-muted">
                      <img
                        src={project.thumbnailUrl}
                        alt={project.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="aspect-video rounded-md mb-3 bg-muted/50 flex items-center justify-center">
                      <Film className="h-8 w-8 text-muted-foreground/30" />
                    </div>
                  )}
                  <h3 className="font-medium text-sm truncate">{project.title}</h3>
                  <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                    <span className="capitalize">{project.mode}</span>
                    {project.rating && <span>{project.rating}</span>}
                    <span
                      className={`inline-flex items-center gap-1 ${
                        project.status === "completed"
                          ? "text-green-400"
                          : project.status === "generating"
                          ? "text-primary"
                          : ""
                      }`}
                    >
                      {project.status === "generating" && (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      )}
                      {project.status}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
