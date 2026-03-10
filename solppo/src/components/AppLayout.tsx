"use client";

import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";

export function AppLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex min-h-screen h-full bg-background relative overflow-hidden text-sm">
            {/* Sidebar Fixa */}
            <div className="w-64 flex-shrink-0 hidden md:block">
                <Sidebar />
            </div>

            {/* Mobile Sidebar (drawer managed inside Sidebar component) */}
            <div className="md:hidden">
                <Sidebar />
            </div>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col h-full overflow-hidden absolute w-full md:w-[calc(100%-16rem)] right-0 top-0 bottom-0 bg-background transition-all duration-300">
                <Header />
                <div className="flex-1 overflow-y-auto w-full p-4 lg:p-8 relative">
                    <div className="mx-auto w-full max-w-7xl">{children}</div>
                </div>
            </main>
        </div>
    );
}
