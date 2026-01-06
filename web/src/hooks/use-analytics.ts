"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { subDays, format, isSameDay } from "date-fns"

export function useAnalytics() {
    const [weeklyData, setWeeklyData] = useState<{ name: string, completed: number }[]>([])
    const [monthlyGoal, setMonthlyGoal] = useState<{ completed: number, total: number } | null>(null)
    const [streak, setStreak] = useState(0)
    const [loading, setLoading] = useState(true)

    const fetchAnalytics = async () => {
        try {
            setLoading(true)
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            // 1. Weekly Progress (Last 7 days)
            const last7Days = Array.from({ length: 7 }, (_, i) => {
                const d = subDays(new Date(), 6 - i)
                return { date: d, name: format(d, 'EEE') }
            })

            const startDate = format(last7Days[0].date, 'yyyy-MM-dd')
            const endDate = format(last7Days[6].date, 'yyyy-MM-dd')

            const { data: logs, error: logsError } = await supabase
                .from('habit_logs')
                .select('date, status')
                .eq('user_id', user.id)
                .gte('date', startDate)
                .lte('date', endDate)
                .eq('status', 'completed')

            if (logsError) throw logsError

            const weeklyStats = last7Days.map(day => {
                const count = logs?.filter(log => isSameDay(new Date(log.date), day.date)).length || 0
                return { name: day.name, completed: count }
            })
            setWeeklyData(weeklyStats)

            // 2. Monthly Goal (Total habits completed this month vs Target)
            // For simplicity, let's assume "Target" is total habits * days in month so far.
            // Or just count total logs.
            // Better: Get all habits, sum their target_per_month (if available) or just 30.
            const startOfMonth = format(new Date(), 'yyyy-MM-01')

            const { count: monthlyCompleted, error: countError } = await supabase
                .from('habit_logs')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', user.id)
                .gte('date', startOfMonth)
                .eq('status', 'completed')

            if (countError) throw countError

            // Get count of active habits to estimate target
            const { count: habitCount } = await supabase
                .from('habits')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', user.id)

            // Estimate target: (Active Habits * Day of Month)
            const dayOfMonth = new Date().getDate()
            const estimatedTarget = (habitCount || 0) * dayOfMonth

            setMonthlyGoal({
                completed: monthlyCompleted || 0,
                total: estimatedTarget > 0 ? estimatedTarget : 1 // Avoid div by 0
            })

            // 3. Streak (Consecutive days with at least 1 habit completed)
            // This is complex in SQL without recursive queries.
            // JS solution: Fetch logs for last 365 days, sort desc, count consecutive days with at least 1 log.
            const { data: streakLogs } = await supabase
                .from('habit_logs')
                .select('date')
                .eq('user_id', user.id)
                .eq('status', 'completed')
                .order('date', { ascending: false })
                .limit(100)

            let currentStreak = 0
            if (streakLogs && streakLogs.length > 0) {
                // Check if today or yesterday has a log
                const uniqueDates = Array.from(new Set(streakLogs.map(l => l.date))) as string[]
                // uniqueDates is already sorted desc

                const todayStr = format(new Date(), 'yyyy-MM-dd')
                const yesterdayStr = format(subDays(new Date(), 1), 'yyyy-MM-dd')

                let hasToday = uniqueDates.includes(todayStr)
                let hasYesterday = uniqueDates.includes(yesterdayStr)

                if (hasToday || hasYesterday) {
                    // If neither, streak is 0.
                    // Start counting backwards.
                    // if hasToday, start from today (index 0). If not, start from yesterday.
                    let checkDate = hasToday ? new Date() : (hasYesterday ? subDays(new Date(), 1) : null)

                    if (checkDate) {
                        // Iterate backwards
                        let streakCount = 0
                        for (let i = 0; i < uniqueDates.length; i++) {
                            const logDate = uniqueDates[i] // string yyyy-MM-dd
                            const targetDate = format(subDays(checkDate, streakCount), 'yyyy-MM-dd')

                            if (logDate === targetDate) {
                                streakCount++
                            } else if (logDate < targetDate) {
                                // missed a day
                                break;
                            }
                        }
                        currentStreak = streakCount
                    }
                }
            }
            setStreak(currentStreak)

        } catch (err) {
            console.error("Error fetching analytics:", err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchAnalytics()
    }, [])

    return { weeklyData, monthlyGoal, streak, loading, refresh: fetchAnalytics }
}
