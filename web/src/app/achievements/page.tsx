"use client"

import { DashboardShell } from "@/components/dashboard-shell"
import { Trophy } from "lucide-react"

export default function AchievementsPage() {
    return (
        <DashboardShell>
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
                <div className="bg-yellow-500/10 p-6 rounded-full">
                    <Trophy className="h-12 w-12 text-yellow-500" />
                </div>
                <h1 className="text-3xl font-bold">Achievements Gallery</h1>
                <p className="text-muted-foreground max-w-md">
                    Gamification system with badges and streaks is currently under development.
                </p>
            </div>
        </DashboardShell>
    )
}
