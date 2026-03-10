"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    Users,
    Package,
    FileText,
    Menu,
    X,
} from "lucide-react";
import { useState } from "react";

const navItems = [
    { label: "Dashboard", href: "/", icon: LayoutDashboard, variant: "gold" },
    { label: "Clientes", href: "/clientes", icon: Users, variant: "blue" },
    { label: "Produtos & Serviços", href: "/itens", icon: Package, variant: "emerald" },
    { label: "Orçamentos", href: "/orcamentos", icon: FileText, variant: "purple" },
];

export function Sidebar() {
    const pathname = usePathname();
    const [mobileOpen, setMobileOpen] = useState(false);

    const nav = (
        <>
            <div className="p-6 flex items-center space-x-3 border-b border-sidebar-border/50">
                <div className="w-9 h-9 rounded-lg bg-primary-custom flex items-center justify-center text-white font-bold text-xl glow-gold">
                    S
                </div>
                <div>
                    <h1 className="text-xl font-bold tracking-tight text-foreground">SOLPPO</h1>
                    <p className="text-[10px] text-muted-foreground uppercase font-semibold tracking-widest">
                        Orçamentos
                    </p>
                </div>
            </div>

            <div className="flex-1 py-6 px-3 space-y-2 overflow-y-auto">
                <div className="px-3 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Módulos
                </div>
                <nav className="space-y-1">
                    {navItems.map((item) => {
                        const isActive =
                            pathname === item.href || (item.href !== "/" && pathname.startsWith(`${item.href}/`));
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setMobileOpen(false)}
                                className={`flex items-center space-x-3 px-3 py-3 rounded-lg transition-colors sidebar-item-premium sidebar-variant-${item.variant} ${isActive
                                        ? "bg-gray-100 dark:bg-gray-900 active text-foreground font-medium"
                                        : "text-muted-foreground hover:bg-gray-100 dark:hover:bg-gray-800/50 hover:text-foreground"
                                    }`}
                            >
                                <item.icon className="h-5 w-5" />
                                <span>{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>
            </div>

            <div className="p-4 border-t border-sidebar-border/50">
                <div className="text-xs text-muted-foreground text-center">
                    Solppo v1.0 — Local
                </div>
            </div>
        </>
    );

    return (
        <>
            {/* Mobile Toggle */}
            <button
                onClick={() => setMobileOpen(true)}
                className="md:hidden fixed top-4 left-4 z-50 p-2 bg-card border border-border rounded-lg shadow-lg"
            >
                <Menu className="h-5 w-5" />
            </button>

            {/* Mobile Overlay */}
            {mobileOpen && (
                <div
                    className="md:hidden fixed inset-0 bg-black/50 z-40"
                    onClick={() => setMobileOpen(false)}
                />
            )}

            {/* Mobile Drawer */}
            <aside
                className={`md:hidden fixed inset-y-0 left-0 w-64 bg-sidebar border-r border-sidebar-border flex flex-col z-50 transition-transform duration-300 ${mobileOpen ? "translate-x-0" : "-translate-x-full"
                    }`}
            >
                <button
                    onClick={() => setMobileOpen(false)}
                    className="absolute top-4 right-4 p-1 text-muted-foreground hover:text-foreground"
                >
                    <X className="h-5 w-5" />
                </button>
                {nav}
            </aside>

            {/* Desktop Sidebar */}
            <aside className="w-64 bg-sidebar border-r border-sidebar-border hidden md:flex flex-col fixed h-full z-10 transition-colors duration-300">
                {nav}
            </aside>
        </>
    );
}
