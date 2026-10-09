"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Icons } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Plus, Building2, Sparkles, ShieldCheck, LogOut, User, LogIn, ChevronDown } from "lucide-react";
import CreateAgentDialog from "./create-agent-dialog";
import type { Agent, Tool } from "@/lib/types";
import { AVAILABLE_TOOLS } from "@/lib/data";
import { useSession, signOut } from "@/lib/auth-client";
import { useToast } from "@/hooks/use-toast";

type HeaderProps = {
  availableTools?: Tool[];
  onAgentCreate?: (newAgent: Agent) => void;
};

export default function Header({
  availableTools = AVAILABLE_TOOLS,
  onAgentCreate = () => {},
}: HeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { toast } = useToast();
  const { data: session, isPending } = useSession();

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Signed Out",
        description: "You have been successfully signed out.",
      });
      router.push("/login");
      router.refresh();
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Sign Out Error",
        description: err.message,
      });
    }
  };

  const user = session?.user;
  const isAdmin = (user as any)?.role === "admin";
  const userInitials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .substring(0, 2)
        .toUpperCase()
    : "AV";

  return (
    <header className="flex items-center justify-between p-4 border-b bg-card">
      <div className="flex items-center gap-6">
        <Link href="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
          <Icons.logo className="h-8 w-8 text-primary" />
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-foreground">AgentVerse</h1>
              {isAdmin ? (
                <Badge variant="outline" className="text-xs bg-amber-500/10 text-amber-500 border-amber-500/20 flex items-center gap-1 font-semibold">
                  <ShieldCheck className="w-3 h-3 text-amber-500" />
                  Super Admin
                </Badge>
              ) : (
                <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/20 flex items-center gap-1 font-semibold">
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  Agency Pro
                </Badge>
              )}
            </div>
            <span className="text-[11px] text-muted-foreground truncate max-w-[180px]">
              {user ? (user.name || user.email) : "Agency Multi-Tenant Studio"}
            </span>
          </div>
        </Link>

        <nav className="flex items-center gap-1.5">
          <Button asChild variant={pathname === "/" ? "secondary" : "ghost"} size="sm">
            <Link href="/">Orchestration</Link>
          </Button>
          <Button asChild variant={pathname === "/clients" ? "secondary" : "ghost"} size="sm">
            <Link href="/clients" className="flex items-center gap-1.5">
              <Building2 className="h-3.5 w-3.5" />
              Client Brands
            </Link>
          </Button>
          <Button asChild variant={pathname === "/agents" ? "secondary" : "ghost"} size="sm">
            <Link href="/agents">Agents</Link>
          </Button>
          <Button asChild variant={pathname === "/bot-builder" ? "secondary" : "ghost"} size="sm">
            <Link href="/bot-builder">Bot Builder</Link>
          </Button>
          <Button asChild variant={pathname === "/workflows" ? "secondary" : "ghost"} size="sm">
            <Link href="/workflows">Workflows</Link>
          </Button>

          {/* Only show Admin navigation button if user has admin role or unauthenticated */}
          {(isAdmin || !user) && (
            <Button
              asChild
              variant={pathname === "/admin" ? "secondary" : "ghost"}
              size="sm"
              className={isAdmin ? "text-amber-500 hover:text-amber-400" : "text-muted-foreground"}
            >
              <Link href="/admin" className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                Admin
              </Link>
            </Button>
          )}
        </nav>
      </div>

      <div className="flex items-center gap-3">
        <CreateAgentDialog
          availableTools={availableTools}
          onAgentCreate={onAgentCreate}
        >
          <Button size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Create Agent
          </Button>
        </CreateAgentDialog>

        {/* User Auth Section */}
        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="relative flex items-center gap-2 pl-2 pr-3 border border-border/50 hover:bg-accent">
                <Avatar className="h-6 w-6">
                  {user.image && <AvatarImage src={user.image} alt={user.name || "User"} />}
                  <AvatarFallback className="text-[10px] bg-primary/20 text-primary font-bold">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
                <span className="text-xs font-medium max-w-[100px] truncate">{user.name || user.email}</span>
                <ChevronDown className="h-3 w-3 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user.name}</p>
                  <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                  <div className="pt-1">
                    <Badge variant="secondary" className="text-[10px] capitalize">
                      Role: {(user as any).role || "Agency"}
                    </Badge>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/clients" className="cursor-pointer flex items-center">
                  <Building2 className="mr-2 h-4 w-4" />
                  Client Brand Contexts
                </Link>
              </DropdownMenuItem>
              {isAdmin && (
                <DropdownMenuItem asChild>
                  <Link href="/admin" className="cursor-pointer flex items-center text-amber-500">
                    <ShieldCheck className="mr-2 h-4 w-4" />
                    SaaS Control Center
                  </Link>
                </DropdownMenuItem>
              )}
              <DropdownMenuItem asChild>
                <Link href="/login" className="cursor-pointer flex items-center">
                  <User className="mr-2 h-4 w-4" />
                  Switch Role / Account
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut} className="text-destructive focus:text-destructive cursor-pointer">
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button asChild size="sm" variant="outline" className="gap-1.5 border-primary/30 text-primary hover:bg-primary/10">
            <Link href="/login">
              <LogIn className="w-3.5 h-3.5" />
              Sign In
            </Link>
          </Button>
        )}
      </div>
    </header>
  );
}
