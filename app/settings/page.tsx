"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const selectedTheme = mounted ? theme ?? "light" : "light";

  return (
    <section className="mx-auto w-full max-w-3xl p-6">
      <h1 className="mb-2 text-2xl font-semibold">Settings</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Choose your preferred appearance mode.
      </p>

      <div className="rounded-xl border bg-card p-5">
        <h2 className="mb-3 text-lg font-medium">Theme</h2>

        <div className="flex gap-3">
          <Button
            type="button"
            variant={selectedTheme === "light" ? "default" : "outline"}
            onClick={() => setTheme("light")}
          >
            Light Mode
          </Button>
          <Button
            type="button"
            variant={selectedTheme === "dark" ? "default" : "outline"}
            onClick={() => setTheme("dark")}
          >
            Dark Mode
          </Button>
        </div>
      </div>
    </section>
  );
}
