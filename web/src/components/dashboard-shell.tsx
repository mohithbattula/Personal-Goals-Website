"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import * as Icons from "lucide-react"
import { cn } from "@/utils/cn"
import { Button } from "@/components/ui/button"

interface NavItem {
    title: string
    href: string
    icon: keyof typeof Icons
}

const navItems: NavItem[] = [
    { title: "Dashboard", href: "/", icon: "LayoutDashboard" },
    { title: "Habits", href: "/habits", icon: "CheckSquare" },
    { title: "Goals", href: "/goals", icon: "Target" },
    { title: "Analytics", href: "/analytics", icon: "BarChart3" },
    { title: "Profile", href: "/profile", icon: "User" },
]

export function DashboardShell({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()
    const router = useRouter()
    const [isOpen, setIsOpen] = useState(false)

    // Auth check (basic client-side for now)
    useEffect(() => {
        const checkUser = async () => {
            const { data: { session } } = await supabase.auth.getSession()
            if (!session) {
                // Redirection logic should ideally be in middleware or handle by a guard component
            }
        }
        checkUser()
    }, [])

    const handleSignOut = async () => {
        await supabase.auth.signOut()
        router.push("/login")
    }

    return (
        <div className="flex min-h-screen bg-background font-sans">
            {/* Mobile Sidebar Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={cn(
                "fixed inset-y-0 left-0 z-50 w-72 border-r border-border bg-card shadow-xl transition-transform lg:static lg:translate-x-0 overflow-y-auto",
                isOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                <div className="flex h-16 items-center border-b border-border px-6 bg-gray-50/50">
                    <Icons.Zap className="h-6 w-6 text-primary mr-2 fill-primary/20" />
                    <span className="text-xl font-black tracking-tighter uppercase text-slate-800">
                        Trackr
                    </span>
                </div>
                <nav className="flex-1 space-y-1 p-4">
                    {navItems.map((item) => {
                        const Icon = Icons[item.icon] as React.ElementType
                        const isActive = pathname === item.href
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "group flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-bold transition-all border border-transparent",
                                    isActive
                                        ? "bg-white text-primary shadow-sm border-gray-100"
                                        : "text-muted-foreground hover:bg-gray-100 hover:text-slate-900"
                                )}
                            >
                                <Icon className={cn("h-4 w-4 transition-transform group-hover:scale-110", isActive ? "text-primary" : "text-slate-400 group-hover:text-slate-900")} />
                                {item.title}
                            </Link>
                        )
                    })}
                </nav>
                <div className="p-4 border-t border-border bg-gray-50/50">
                    <Button variant="ghost" className="w-full justify-start font-bold text-slate-500 hover:text-red-600 hover:bg-red-50" onClick={handleSignOut}>
                        <Icons.LogOut className="mr-2 h-4 w-4" />
                        Sign Out
                    </Button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex flex-1 flex-col">
                {/* Header (Mobile Trigger) */}
                <header className="flex h-16 items-center gap-4 border-b border-border bg-background/50 backdrop-blur px-6 lg:hidden">
                    <Button variant="ghost" size="icon" onClick={() => setIsOpen(true)}>
                        <Icons.Menu className="h-6 w-6" />
                    </Button>
                    <span className="text-lg font-bold">Menu</span>
                </header>

                <main className="flex-1 p-6 md:p-8 overflow-x-hidden overflow-y-auto">
                    <div className="mx-auto max-w-6xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    )
}
