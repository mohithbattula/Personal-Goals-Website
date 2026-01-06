"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Trophy } from "lucide-react"
import { Habit } from "@/hooks/use-habits"

interface TopHabitsProps {
    habits: Habit[]
    getHabitScore: (habitId: number) => number
}

export function TopHabits({ habits, getHabitScore }: TopHabitsProps) {
    // Sort habits by score desc
    const sorted = [...habits].sort((a, b) => getHabitScore(b.id) - getHabitScore(a.id)).slice(0, 10)

    return (
        <Card className="glass-card shadow-sm border border-slate-200">
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-500">Top 10 Daily Habits</CardTitle>
                <CardDescription>Most consistent performance</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4 pt-2">
                    {sorted.map((habit, i) => {
                        const score = getHabitScore(habit.id)
                        return (
                            <div key={habit.id} className="flex items-center gap-4 group">
                                <div className="w-6 text-center font-bold text-slate-300 text-sm">{i + 1}</div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-center mb-1">
                                        <div className="font-bold text-slate-800 text-sm flex items-center gap-2">
                                            <span>{habit.name}</span>
                                            <span className="text-base">{habit.icon}</span>
                                        </div>
                                        <span className="text-xs font-bold text-slate-400">{score}%</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-primary rounded-full"
                                            style={{ width: `${score}%` }}
                                        />
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </CardContent>
        </Card>
    )
}
