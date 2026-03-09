import { LayoutDashboard, Target, MessageSquare, Plus, Sparkles } from "lucide-react";
import { Link, useLocation } from "wouter";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
} from "@/components/ui/sidebar";

const navItems = [
  { title: "Task Board", url: "/", icon: LayoutDashboard },
  { title: "Goal Breakdown", url: "/goals", icon: Target },
  { title: "AI Assistant", url: "/chat", icon: MessageSquare },
];

export function AppSidebar() {
  const [location] = useLocation();

  return (
    <Sidebar variant="inset" className="border-r border-border/50">
      <SidebarHeader className="p-4 border-b border-border/50 bg-sidebar">
        <div className="flex items-center gap-3 font-display font-bold text-lg text-primary">
          <div className="p-2 rounded-xl bg-gradient-to-br from-primary to-accent text-primary-foreground shadow-sm">
            <Sparkles className="w-5 h-5" />
          </div>
          NexaTask
        </div>
      </SidebarHeader>
      
      <SidebarContent className="p-4">
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
            Workspace
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-2">
              {navItems.map((item) => {
                const isActive = location === item.url || (item.url !== "/" && location.startsWith(item.url));
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton 
                      asChild 
                      isActive={isActive}
                      className={`
                        rounded-xl transition-all duration-200 py-3 h-auto
                        ${isActive 
                          ? 'bg-primary/10 text-primary font-medium shadow-sm border border-primary/20' 
                          : 'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground text-muted-foreground'
                        }
                      `}
                    >
                      <Link href={item.url} className="flex items-center gap-3">
                        <item.icon className={`w-5 h-5 ${isActive ? 'text-primary' : 'text-muted-foreground/70'}`} />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
