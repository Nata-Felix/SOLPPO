"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function Header() {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    return (
        <header className="h-16 bg-background/80 backdrop-blur-md border-b border-border/50 flex items-center justify-between px-4 md:px-8 sticky top-0 z-10 transition-colors duration-300">
            {/* Left side - spacer for mobile menu button */}
            <div className="md:hidden w-10" />

            <div className="hidden md:block">
                <h2 className="text-lg font-bold text-foreground">Solppo</h2>
                <p className="text-xs text-muted-foreground">
                    Sistema de Orçamentos — Local
                </p>
            </div>

            <div className="flex items-center space-x-3">
                <button
                    onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                    className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-full transition-colors"
                    aria-label="Alternar tema"
                >
                    {mounted && theme === "dark" ? (
                        <Sun className="h-5 w-5" />
                    ) : (
                        <Moon className="h-5 w-5" />
                    )}
                </button>
            </div>
        </header>
    );
}
