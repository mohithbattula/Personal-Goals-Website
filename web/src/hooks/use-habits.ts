"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { format } from "date-fns"

export type Habit = {
    id: number
    name: string
    icon: string | null
    target_per_month: number
    frequency: string[]
    position: number
    current_streak: number
    longest_streak: number
    completed?: boolean
}

export function useHabits(date: Date, filterByFrequency: boolean = true) {
    const [habits, setHabits] = useState<Habit[]>([])
    const [loading, setLoading] = useState(true)
    const formattedDate = format(date, "yyyy-MM-dd")
    const dayName = format(date, "EEE")

    const fetchHabits = async (showLoading = true) => {
        try {
            if (showLoading) setLoading(true)
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            // Get all habits
            const { data: habitsData, error: habitsError } = await supabase
                .from("habits")
                .select("*")
                .eq("user_id", user.id)
                .order("position", { ascending: true })
                .order("created_at", { ascending: true })

            if (habitsError) throw habitsError

            // Get logs for the selected date
            const { data: logsData, error: logsError } = await supabase
                .from("habit_logs")
                .select("habit_id, status")
                .eq("user_id", user.id)
                .eq("date", formattedDate)

            if (logsError) throw logsError

            const logsMap = new Map()
            logsData?.forEach(log => {
                if (log.status === 'completed') logsMap.set(log.habit_id, true)
            })

            // Filter by frequency and merge status
            const merged = habitsData
                .filter(h => !filterByFrequency || !h.frequency || h.frequency.includes(dayName))
                .map(h => ({
                    ...h,
                    completed: logsMap.has(h.id)
                }))

            setHabits(merged)
        } catch (error) {
            console.error("Error fetching habits:", error)
        } finally {
            if (showLoading) setLoading(false)
        }
    }

    const reorderHabits = async (newOrder: Habit[]) => {
        // Optimistic update
        setHabits(newOrder)

        // Persist to DB (one by one for simplicity and safety)
        for (const [index, habit] of newOrder.entries()) {
            await supabase.from('habits').update({ position: index }).eq('id', habit.id)
        }
    }

    const toggleHabit = async (habitId: number, currentStatus: boolean) => {
        // Optimistic update
        setHabits(prev => prev.map(h =>
            h.id === habitId ? { ...h, completed: !currentStatus } : h
        ))

        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        if (!currentStatus) {
            // Mark as complete
            await supabase.from("habit_logs").insert({
                user_id: user.id,
                habit_id: habitId,
                date: formattedDate,
                status: 'completed'
            })
        } else {
            // Remove completion
            await supabase.from("habit_logs").delete()
                .eq("user_id", user.id)
                .eq("habit_id", habitId)
                .eq("date", formattedDate)
        }

        // Refresh streaks silently
        await fetchHabits(false)
    }

    useEffect(() => {
        fetchHabits()
    }, [formattedDate])

    return { habits, loading, toggleHabit, refresh: fetchHabits, reorderHabits }
}
