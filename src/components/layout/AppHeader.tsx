"use client";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { APP_NAME } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Sun, Moon } from "lucide-react";
import { useEffect, useState } from "react";

export function AppHeader() {
  const [mounted, setMounted] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Check initial theme from localStorage or system preference
    const currentTheme = localStorage.getItem('theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    setIsDarkMode(currentTheme === 'dark');
    document.documentElement.classList.toggle('dark', currentTheme === 'dark');
  }, []);

  const toggleTheme = () => {
    const newTheme = !isDarkMode ? 'dark' : 'light';
    setIsDarkMode(!isDarkMode);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark', !isDarkMode);
  };

  if (!mounted) {
    return ( // Return a placeholder or null during server rendering / pre-hydration
      <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b bg-background/80 backdrop-blur-sm px-4 md:px-6">
        <div className="md:hidden">
          <SidebarTrigger />
        </div>
        <h1 className="text-xl font-semibold text-primary font-headline">{APP_NAME}</h1>
        <div className="ml-auto flex items-center gap-4">
          <Button variant="ghost" size="icon" aria-label="Toggle theme" className="h-8 w-8">
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </Button>
          <Avatar className="h-8 w-8">
            <AvatarImage src="https://placehold.co/100x100.png" alt="User Avatar" data-ai-hint="user avatar" />
            <AvatarFallback>U</AvatarFallback>
          </Avatar>
        </div>
      </header>
    );
  }


  return (
    <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b bg-background/80 backdrop-blur-sm px-4 md:px-6">
      <div className="md:hidden">
        <SidebarTrigger />
      </div>
      <h1 className="text-xl font-semibold text-primary font-headline">{APP_NAME}</h1>
      <div className="ml-auto flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle theme" className="h-8 w-8">
          {isDarkMode ? 
            <Sun className="h-5 w-5 transition-all" /> : 
            <Moon className="h-5 w-5 transition-all" />
          }
        </Button>
        <Avatar className="h-8 w-8">
          <AvatarImage src="https://placehold.co/100x100.png" alt="User Avatar" data-ai-hint="user avatar" />
          <AvatarFallback>U</AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}
