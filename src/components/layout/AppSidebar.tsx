
"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { LayoutDashboard, FileText, FilePlus, Bot, Settings, LogOut } from "lucide-react";
import { APP_NAME } from "@/lib/constants";
import Image from "next/image";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/quotations", label: "Quotations", icon: FileText },
  { href: "/quotations/new", label: "New Quotation", icon: FilePlus },
  { href: "/invoices", label: "Invoices", icon: FileText },
  { href: "/ai-suggest", label: "AI Suggestion", icon: Bot },
];

const bottomNavItems = [
    // { href: "/settings", label: "Settings", icon: Settings },
    // { href: "/logout", label: "Logout", icon: LogOut },
];


export function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="icon" variant="sidebar" side="left">
      <SidebarHeader className="p-4 items-center justify-center">
        <Link href="/dashboard" className="flex items-center gap-2 group-data-[collapsible=icon]:justify-center">
          {/* Using an inline SVG for the logo as per guidelines on non-textual code */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-8 w-8 text-primary group-data-[collapsible=icon]:h-6 group-data-[collapsible=icon]:w-6 transition-all"
            aria-label="ExpoStand Pro Logo"
          >
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
          </svg>
          <span className="font-bold text-lg text-primary group-data-[collapsible=icon]:hidden font-headline">
            {APP_NAME}
          </span>
        </Link>
      </SidebarHeader>
      <SidebarContent className="p-2">
        <SidebarMenu>
          {navItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <Link href={item.href} asChild>
                <SidebarMenuButton
                  isActive={pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href))}
                  tooltip={{ children: item.label, className: "bg-primary text-primary-foreground" }}
                  className="aria-[current=page]:bg-sidebar-primary aria-[current=page]:text-sidebar-primary-foreground"
                  aria-current={pathname.startsWith(item.href) ? "page" : undefined}
                >
                  <>
                    <item.icon />
                    <span>{item.label}</span>
                  </>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      {bottomNavItems.length > 0 && (
        <SidebarFooter className="p-2 border-t border-sidebar-border mt-auto">
          <SidebarMenu>
            {bottomNavItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <Link href={item.href} asChild>
                  <SidebarMenuButton
                    tooltip={{ children: item.label, className: "bg-primary text-primary-foreground" }}
                  >
                    <>
                      <item.icon />
                      <span>{item.label}</span>
                    </>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarFooter>
      )}
    </Sidebar>
  );
}
