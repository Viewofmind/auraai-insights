import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Bot,
  FileText,
  Sparkles,
  BarChart3,
  Radar,

  Activity,
  User,
  Users,
  ShieldCheck,
  ScrollText,
  Settings,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useAuth, roleLabels } from "@/lib/auth/AuthContext";

const nav = [
  { label: "Dashboard", to: "/", icon: LayoutDashboard },
  { label: "Agents Hub", to: "/agents", icon: Bot },
  { label: "Content Queue", to: "/content", icon: FileText },
  { label: "Opportunities", to: "/opportunities", icon: Sparkles },
  { label: "Outreach", to: "/outreach", icon: Users },
  { label: "GEO", to: "/geo", icon: Radar },
  { label: "Analytics", to: "/analytics", icon: BarChart3 },
] as const;


const governanceNav = [
  { label: "Compliance", to: "/compliance", icon: ShieldCheck },
  { label: "Audit Log", to: "/audit", icon: ScrollText },
  { label: "Integrations", to: "/settings", icon: Settings },
] as const;


export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const { user } = useAuth();
  const pathname = useRouterState({ select: (r) => r.location.pathname });

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-2.5 px-2 py-2.5">
          <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-emerald via-emerald to-cyan shadow-[0_0_24px_-4px_var(--emerald)] ring-1 ring-emerald/30">
            <Activity className="h-4 w-4 text-background" strokeWidth={2.75} />
          </div>
          {!collapsed && (
            <div className="flex min-w-0 flex-col leading-tight">
              <span className="truncate bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-sm font-semibold tracking-tight text-transparent">
                AuraAI
              </span>
              <span className="truncate font-mono text-[9.5px] uppercase tracking-[0.18em] text-muted-foreground">
                CMO · InvestSights
              </span>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] uppercase tracking-[0.14em]">
            Workspace
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {nav.map((item) => {
                const active =
                  item.to === "/"
                    ? pathname === "/"
                    : pathname.startsWith(item.to);
                return (
                  <SidebarMenuItem key={item.to}>
                    <SidebarMenuButton asChild isActive={active} tooltip={item.label}>
                      <Link to={item.to} className="flex items-center gap-2.5">
                        <item.icon className="h-4 w-4" />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] uppercase tracking-[0.14em]">
            Governance
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {governanceNav.map((item) => (
                <SidebarMenuItem key={item.to}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname.startsWith(item.to)}
                    tooltip={item.label}
                  >
                    <Link to={item.to} className="flex items-center gap-2.5">
                      <item.icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        <Link
          to="/login"
          className="flex items-center gap-2.5 rounded-md px-2 py-2 transition-colors hover:bg-sidebar-accent"
        >
          <div className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-cyan/30 to-emerald/30 text-[11px] font-semibold ring-1 ring-border/60">
            <User className="h-3.5 w-3.5" />
          </div>
          {!collapsed && (
            <div className="flex min-w-0 flex-col leading-tight">
              <span className="truncate text-xs font-medium">{user ? user.email : "User"}</span>
              <span className="truncate font-mono text-[9.5px] uppercase tracking-[0.14em] text-muted-foreground">
                {user ? roleLabels[user.role] : "Not signed in"}
              </span>
            </div>
          )}
        </Link>
      </SidebarFooter>

    </Sidebar>
  );
}
