"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

export function Header() {
  const supabase = createClient();
  const {
    data: { publicUrl: logoUrl },
  } = supabase.storage
    .from("logo-site")
    .getPublicUrl("menu-logo/menu-logo.png");

  const {
    data: { publicUrl: openAiLogoUrl },
  } = supabase.storage
    .from("logo-site")
    .getPublicUrl("gpt-logo/open-ai-logo.png");

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
                src={openAiLogoUrl}
                alt="OpenAI logo"
                className="h-4 w-4 object-contain"
              />
              <span>CarGPT</span>
            </Link>
          </Button>
        </div>
      </nav>
    </header>
  );
}
