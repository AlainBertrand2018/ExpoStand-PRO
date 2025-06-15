
"use client";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { AppHeader } from "@/components/layout/AppHeader";
import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { FullPageLoading } from "@/components/shared/LoadingSpinner";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [isMounted, setIsMounted] = useState(false);
  const { currentUser, isLoading: authIsLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted && !authIsLoading && !currentUser) {
      router.replace('/login');
    }
  }, [isMounted, authIsLoading, currentUser, router]);

  if (!isMounted || authIsLoading) {
    return <FullPageLoading message="Authenticating..." />;
  }

  if (!currentUser) {
    // This case should ideally be covered by the redirect,
    // but as a fallback, show loading or a minimal message.
    return <FullPageLoading message="Redirecting to login..." />;
  }
  
  return (
    <SidebarProvider defaultOpen={true}>
      <AppSidebar />
      <SidebarInset>
        <AppHeader />
        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-auto">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
