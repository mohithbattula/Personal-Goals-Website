"use client"

import { useState, useEffect, useMemo } from "react"
import { DashboardShell } from "@/components/dashboard-shell"
import { supabase } from "@/lib/supabase"
import { format, startOfMonth, endOfMonth, eachDayOfInterval } from "date-fns"
import { HabitMatrix } from "@/components/habit-matrix"
import { AnalyticsCharts } from "@/components/analytics-charts"
import { TopHabits } from "@/components/top-habits"
import { useHabits } from "@/hooks/use-habits"
import { Loader2 } from "lucide-react"

export default function AnalyticsPage() {
    const [currentDate, setCurrentDate] = useState(new Date())
    const [logs, setLogs] = useState<{ habit_id: number; date: string; status: string }[]>([])
    const [loading, setLoading] = useState(true)

    // Reuse existing habits hook just for the list of habits
    const { habits, loading: habitsLoading, refresh } = useHabits(currentDate, false)

    // Fetch full month logs
    const fetchMonthLogs = async () => {
        try {
            setLoading(true)
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            const start = format(startOfMonth(currentDate), "yyyy-MM-dd")
            const end = format(endOfMonth(currentDate), "yyyy-MM-dd")

            const { data, error } = await supabase
                .from("habit_logs")
                .select("habit_id, date, status")
                .eq("user_id", user.id)
                .gte("date", start)
                .lte("date", end)

            if (data) setLogs(data)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchMonthLogs()
    }, [currentDate])

    // Handle Toggle from Matrix
    const handleToggle = async (habitId: number, date: Date, currentStatus: boolean) => {
        const dateStr = format(date, "yyyy-MM-dd")
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        // Optimistic Update
        if (currentStatus) {
            setLogs(prev => prev.filter(l => !(l.habit_id === habitId && l.date === dateStr)))
            await supabase.from("habit_logs").delete().match({ user_id: user.id, habit_id: habitId, date: dateStr })
        } else {
            setLogs(prev => [...prev, { habit_id: habitId, date: dateStr, status: 'completed' }])
            await supabase.from("habit_logs").insert({ user_id: user.id, habit_id: habitId, date: dateStr, status: 'completed' })
        }

        // Refresh habits to get updated streaks
        await refresh(false)
    }

    // Derived Statistics
    const stats = useMemo(() => {
        const days = eachDayOfInterval({ start: startOfMonth(currentDate), end: endOfMonth(currentDate) })

        // Trend Data (Sum of completed habits per day in month)
        const trendData = days.map(day => {
            const dStr = format(day, "yyyy-MM-dd")
            const count = logs.filter(l => l.date === dStr && l.status === 'completed').length
            return { date: dStr, value: count }
        })

        // Total Efficiency (Total Completed / Total Possible)
        // Total Possible = habits.length * daysSoFar (or daysInMonth)
        // Let's do simply: Total Completed vs Total Remaining for *active* days
        const totalCompleted = logs.filter(l => l.status === 'completed').length
        const totalPossible = habits.length * days.length // Simplification
        const efficiency = totalPossible > 0 ? Math.round((totalCompleted / totalPossible) * 100) : 0

        // Modern Blue for "Completed", Light Slate for "Missed"
        const pieData = [
            { name: 'Completed', value: efficiency, color: '#3b82f6' }, // blue-500
            { name: 'Missed', value: 100 - efficiency, color: '#e2e8f0' } // slate-200
        ]

        return { trendData, pieData }
    }, [logs, habits, currentDate])

    // Get Score per habit
    const getHabitScore = (habitId: number) => {
        const habitLogs = logs.filter(l => l.habit_id === habitId && l.status === 'completed')
        // Simple score: (completed / days in month) * 100
        // Or we could limit to days passed. Let's do days passed.
        const today = new Date()
        const start = startOfMonth(currentDate)
        const end = endOfMonth(currentDate) > today ? today : endOfMonth(currentDate)

        const daysCount = Math.max(1, Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1)

        return Math.round((habitLogs.length / daysCount) * 100)
    }

    return (
        <DashboardShell>
            <div className="space-y-8">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-slate-900 uppercase">Analytics Dashboard</h1>
                    <p className="text-muted-foreground">Detailed breakdown of your performance for {format(currentDate, 'MMMM yyyy')}</p>
                </div>

                {loading || habitsLoading ? (
                    <div className="flex justify-center p-20">
                        <Loader2 className="animate-spin h-8 w-8 text-primary" />
                    </div>
                ) : (
                    <>
                        <AnalyticsCharts trendData={stats.trendData} pieData={stats.pieData} />

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-2">
                                <HabitMatrix
                                    habits={habits}
                                    logs={logs}
                                    currentDate={currentDate}
                                    onToggle={handleToggle}
                                />
                            </div>
                            <div>
                                <TopHabits habits={habits} getHabitScore={getHabitScore} />
                            </div>
                        </div>
                    </>
                )}
            </div>
        </DashboardShell>
    )
}
