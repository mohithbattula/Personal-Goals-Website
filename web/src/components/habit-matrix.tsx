"use client"

import { useMemo, Fragment } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { motion } from "framer-motion"
import { Check, X, Minus } from "lucide-react"
import { cn } from "@/utils/cn"
import { format, eachDayOfInterval, startOfMonth, endOfMonth, isSameDay, isToday } from "date-fns"
import { Habit } from "@/hooks/use-habits"

interface HabitMatrixProps {
    habits: Habit[]
    logs: { habit_id: number; date: string; status: string }[]
    currentDate: Date
    onToggle: (habitId: number, date: Date, currentStatus: boolean) => void
}

export function HabitMatrix({ habits, logs, currentDate, onToggle }: HabitMatrixProps) {
    const daysInMonth = useMemo(() => {
        return eachDayOfInterval({
            start: startOfMonth(currentDate),
            end: endOfMonth(currentDate)
        })
    }, [currentDate])

    const getStatus = (habitId: number, date: Date) => {
        const dateStr = format(date, 'yyyy-MM-dd')
        const log = logs.find(l => l.habit_id === habitId && l.date === dateStr)
        return log?.status === 'completed'
    }

    // Weeks grouping
    const weeks = useMemo(() => {
        const weeksArr: Date[][] = []
        let currentWeek: Date[] = []

        daysInMonth.forEach((day) => {
            currentWeek.push(day)
            if (day.getDay() === 0 || isSameDay(day, daysInMonth[daysInMonth.length - 1])) {
                weeksArr.push(currentWeek)
                currentWeek = []
            }
        })
        return weeksArr
    }, [daysInMonth])

    return (
        <div className="space-y-8 overflow-x-auto pb-4">
            {/* Render mostly as a list of "Week Cards" to handle responsiveness better than a massive 30-col table */}
            {weeks.map((week, weekIndex) => (
                <Card key={weekIndex} className="glass-card shadow-sm border rounded-none border-x-0 sm:border-x sm:rounded md:rounded-lg">
                    <CardHeader className="py-4 bg-slate-50/50 border-b">
                        <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-500">
                            Week {weekIndex + 1} ({format(week[0], 'MMM d')} - {format(week[week.length - 1], 'MMM d')})
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="grid" style={{ gridTemplateColumns: `minmax(150px, 2fr) repeat(${week.length}, minmax(40px, 1fr))` }}>

                            {/* Header Row */}
                            <div className="p-3 border-b border-r bg-slate-50 font-bold text-xs text-slate-500 sticky left-0 z-10 flex items-center">
                                HABIT
                            </div>
                            {week.map(day => (
                                <div key={day.toISOString()} className={cn(
                                    "p-2 border-b border-r text-center font-bold text-xs flex flex-col items-center justify-center",
                                    isToday(day) ? "bg-primary/5 text-primary" : "bg-slate-50 text-slate-500"
                                )}>
                                    <span>{format(day, 'EEE')}</span>
                                    <span className="text-lg">{format(day, 'd')}</span>
                                </div>
                            ))}

                            {/* Rows */}
                            {habits.map(habit => (
                                <Fragment key={habit.id}>
                                    <div className="sticky left-0 z-10 bg-white p-3 border-b border-r font-medium text-sm flex items-center gap-2 truncate shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">
                                        <span className="text-lg">{habit.icon}</span>
                                        <span className="truncate">{habit.name}</span>
                                    </div>
                                    {week.map(day => {
                                        const isCompleted = getStatus(habit.id, day)
                                        const dayName = format(day, "EEE")
                                        const isScheduled = !habit.frequency || habit.frequency.includes(dayName)
                                        const isFuture = day > new Date()

                                        if (!isScheduled) {
                                            return (
                                                <div key={`${habit.id}-${day.toISOString()}`} className="border-b border-r p-1 bg-slate-50/30 flex items-center justify-center">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-slate-200" />
                                                </div>
                                            )
                                        }

                                        return (
                                            <div
                                                key={`${habit.id}-${day.toISOString()}`}
                                                className={cn(
                                                    "border-b border-r flex items-center justify-center p-1 transition-colors relative group",
                                                    isFuture ? "bg-slate-50/50 cursor-not-allowed" : "cursor-pointer hover:bg-slate-50 opacity-90 hover:opacity-100"
                                                )}
                                                onClick={() => !isFuture && onToggle(habit.id, day, isCompleted)}
                                            >
                                                <motion.div
                                                    initial={false}
                                                    animate={{ scale: isCompleted ? 1 : 0.8, opacity: isCompleted ? 1 : 0.3 }}
                                                    className={cn(
                                                        "w-6 h-6 rounded flex items-center justify-center transition-all",
                                                        isCompleted ? "bg-primary text-white shadow-sm" : "bg-slate-200 text-transparent"
                                                    )}
                                                >
                                                    <Check className="w-4 h-4" />
                                                </motion.div>
                                                {!isFuture && !isCompleted && (
                                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 pointer-events-none">
                                                        <div className="w-6 h-6 rounded border-2 border-slate-300"></div>
                                                    </div>
                                                )}
                                            </div>
                                        )
                                    })}
                                </Fragment>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}
