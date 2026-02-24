import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Shield, Users, Loader2, Crown, User } from "lucide-react";

export default function AdminUsers() {
  const { user: currentUser } = useAuth();
  const utils = trpc.useUtils();

  const usersQuery = trpc.admin.listUsers.useQuery(undefined, {
    retry: false,
  });

  const updateRoleMutation = trpc.admin.updateUserRole.useMutation({
    onSuccess: () => {
      utils.admin.listUsers.invalidate();
      toast.success("User role updated");
    },
    onError: (err) => {
      toast.error(err.message || "Failed to update role");
    },
  });

  if (currentUser?.role !== "admin") {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <Card className="border-border/50 bg-card/80 max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mb-2">
              <Shield className="w-6 h-6 text-red-500" />
            </div>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>You need admin privileges to access this page.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (usersQuery.isLoading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
      </div>
    );
  }

  if (usersQuery.error) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <Card className="border-border/50 bg-card/80 max-w-md">
          <CardHeader className="text-center">
            <CardTitle>Error</CardTitle>
            <CardDescription>{usersQuery.error.message}</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const users = usersQuery.data ?? [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Users className="w-6 h-6 text-amber-500" />
            User Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage user accounts and roles ({users.length} user{users.length !== 1 ? "s" : ""})
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-border/50 bg-card/80">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <Users className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{users.length}</p>
                <p className="text-xs text-muted-foreground">Total Users</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50 bg-card/80">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <Crown className="w-5 h-5 text-purple-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{users.filter(u => u.role === "admin").length}</p>
                <p className="text-xs text-muted-foreground">Admins</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50 bg-card/80">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <User className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{users.filter(u => u.role === "user").length}</p>
                <p className="text-xs text-muted-foreground">Regular Users</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Users Table */}
      <Card className="border-border/50 bg-card/80">
        <CardHeader>
          <CardTitle className="text-lg">All Users</CardTitle>
          <CardDescription>View and manage registered users</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">User</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Email</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Role</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Login Method</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Joined</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Last Active</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b border-border/30 hover:bg-muted/30 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500/20 to-amber-700/20 flex items-center justify-center text-sm font-medium text-amber-500">
                          {(u.name || "?").charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium text-foreground text-sm">
                          {u.name || "Unnamed"}
                          {u.id === currentUser?.id && (
                            <Badge variant="outline" className="ml-2 text-[10px] py-0">You</Badge>
                          )}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-muted-foreground">{u.email || "—"}</td>
                    <td className="py-3 px-4">
                      <Badge
                        variant={u.role === "admin" ? "default" : "secondary"}
                        className={u.role === "admin" ? "bg-purple-500/20 text-purple-400 border-purple-500/30" : ""}
                      >
                        {u.role === "admin" ? (
                          <><Crown className="w-3 h-3 mr-1" /> Admin</>
                        ) : (
                          <><User className="w-3 h-3 mr-1" /> User</>
                        )}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-sm text-muted-foreground capitalize">{u.loginMethod || "oauth"}</td>
                    <td className="py-3 px-4 text-sm text-muted-foreground">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-sm text-muted-foreground">
                      {new Date(u.lastSignedIn).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-right">
                      {u.id === currentUser?.id ? (
                        <span className="text-xs text-muted-foreground">—</span>
                      ) : (
                        <Select
                          value={u.role}
                          onValueChange={(newRole) => {
                            updateRoleMutation.mutate({ userId: u.id, role: newRole as "user" | "admin" });
                          }}
                          disabled={updateRoleMutation.isPending}
                        >
                          <SelectTrigger className="w-[110px] h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="user">User</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-muted-foreground">
                      No users found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
