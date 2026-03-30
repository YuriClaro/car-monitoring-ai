"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

export function Header() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const selectedTheme = mounted ? theme ?? "light" : "light";
  const isDark = selectedTheme === "dark";

  const supabase = createClient();
  const {
    data: { publicUrl: logoUrl },
  } = supabase.storage
    .from("logo-site")
    .getPublicUrl("menu-logo/menu-logo.png");

  const {
    data: { publicUrl: openAiLightLogoUrl },
  } = supabase.storage
    .from("logo-site")
    .getPublicUrl("gpt-logo/open-ai-light-logo.png");

  const {
    data: { publicUrl: openAiDarkLogoUrl },
  } = supabase.storage
    .from("logo-site")
    .getPublicUrl("gpt-logo/open-ai-dark-logo.png");

  return (
    <header className="border-b bg-background">
      <nav className="mx-auto max-w-7xl h-16 px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="w-52 h-14 rounded-lg overflow-hidden flex items-center justify-center">
            <img
              src={logoUrl}
              alt="Car Health Care logo"
              className="h-full w-full object-contain object-center scale-150 translate-y-1 block"
            />
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <Button variant="ghost" asChild>
            <Link href="/ai-car" className="flex items-center gap-2">
              <img
                src={openAiLightLogoUrl}
                alt="OpenAI logo for light mode"
                className="h-4 w-4 object-contain dark:hidden"
              />
              <img
                src={openAiDarkLogoUrl}
                alt="OpenAI logo for dark mode"
                className="hidden h-4 w-4 object-contain dark:block"
              />
              <span>CarGPT</span>
            </Link>
          </Button>

          <Button
            type="button"
            variant="ghost"
            onClick={() => setTheme(isDark ? "light" : "dark")}
          >
            {isDark ? "Light Mode" : "Dark Mode"}
          </Button>
        </div>
      </nav>
    </header>
  );
}
