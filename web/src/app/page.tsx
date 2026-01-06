"use client"

import { useState, useEffect } from "react"
import { DashboardShell } from "@/components/dashboard-shell"
import { useHabits } from "@/hooks/use-habits"
import { useAnalytics } from "@/hooks/use-analytics"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Check, Trophy, Flame, TrendingUp } from "lucide-react"
import { cn } from "@/utils/cn"
import { format } from "date-fns"
import { motion, AnimatePresence, Reorder } from "framer-motion"
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from "recharts"
import { HabitItem } from "@/components/habit-item"
import { useRouter } from "next/navigation"

export default function Dashboard() {
  const [date] = useState(new Date())
  const { habits, loading: habitsLoading, toggleHabit, refresh: refreshHabits, reorderHabits } = useHabits(date)
  const { weeklyData, monthlyGoal, streak, loading: analyticsLoading, refresh: refreshAnalytics } = useAnalytics()
  const router = useRouter()

  const handleToggle = async (id: number, status: boolean) => {
    await toggleHabit(id, status)
    refreshAnalytics()
  }

  // Monthly Goal Data for Pie Chart
  const percentage = monthlyGoal
    ? Math.min(Math.round((monthlyGoal.completed / monthlyGoal.total) * 100), 100)
    : 0

  const completionData = [
    { name: 'Completed', value: percentage, color: '#3b82f6' }, // Modern Blue
    { name: 'Remaining', value: 100 - percentage, color: '#e2e8f0' } // Slate-200
  ]

  const handleAddHabit = () => {
    router.push("/habits")
  }

  return (
    <DashboardShell>
      <div className="flex flex-col gap-8">

        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent pb-1">
              {format(date, "EEEE")} Overview
            </h1>
            <p className="text-muted-foreground mt-1">
              Tracking for {format(date, "MMMM do, yyyy")}
            </p>
          </div>
          <div className="flex gap-2">
            <Card className="glass-card border-none bg-orange-50/50 text-orange-600 px-4 py-2 flex items-center gap-2">
              <Flame className="w-5 h-5 fill-orange-500 text-orange-500" />
              <span className="font-bold">{streak} Day Streak</span>
            </Card>
            <Button onClick={handleAddHabit}>
              <Plus className="mr-2 h-4 w-4" /> New Habit
            </Button>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Daily Checklist */}
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Check className="w-5 h-5 text-primary" /> Daily Habits
            </h2>

            <div className="grid gap-3">
              {habitsLoading ? (
                <div className="p-8 text-center text-muted-foreground">Loading your habits...</div>
              ) : habits.length === 0 ? (
                <Card className="p-8 text-center border-dashed">
                  <p className="text-muted-foreground mb-4">You have no habits for today.</p>
                  <Button onClick={handleAddHabit} variant="outline">Create your first habit</Button>
                </Card>
              ) : (
                <div className="space-y-4">
                  {/* Active Habits (Reorderable) */}
                  <Reorder.Group
                    axis="y"
                    values={habits.filter(h => !h.completed)}
                    onReorder={(newOrder) => {
                      // Merge new active order with existing completed items
                      const completed = habits.filter(h => h.completed)
                      reorderHabits([...newOrder, ...completed])
                    }}
                    className="space-y-3"
                  >
                    {habits.filter(h => !h.completed).map((habit) => (
                      <HabitItem
                        key={habit.id}
                        habit={habit}
                        onToggle={handleToggle}
                      />
                    ))}
                  </Reorder.Group>

                  {/* Completed Habits (Non-draggable) */}
                  <div className="space-y-3 opacity-60">
                    {habits.filter(h => h.completed).map((habit) => (
                      <div
                        key={habit.id}
                        className="group flex items-center justify-between p-4 rounded-xl border transition-all duration-300 cursor-pointer bg-primary/5 border-primary/20"
                        onClick={() => handleToggle(habit.id, !!habit.completed)}
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-6 h-6 rounded-md border-2 bg-primary border-primary flex items-center justify-center transition-colors">
                            <Check className="w-4 h-4 text-white" />
                          </div>
                          <div>
                            <h3 className="font-medium bg-transparent outline-none transition-all text-muted-foreground line-through">
                              {habit.name}
                            </h3>
                          </div>
                        </div>
                        {habit.icon && <span className="text-xl">{habit.icon}</span>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Analytics Column */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" /> Analytics
            </h2>

            {/* Weekly Progress */}
            <Card
              className="glass-card hover:shadow-lg transition-transform hover:-translate-y-1 cursor-pointer"
              onClick={() => router.push('/analytics')}
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Weekly Completion</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[200px] w-full">
                  {analyticsLoading ? (
                    <div className="h-full flex items-center justify-center text-xs text-muted-foreground">Calculating...</div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={weeklyData}>
                        <Tooltip
                          cursor={{ fill: 'transparent' }}
                          contentStyle={{ borderRadius: '8px', border: 'none', background: 'rgba(255, 255, 255, 0.9)', color: 'black', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        />
                        <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                        <Bar dataKey="completed" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Monthly Goal */}
            <Card
              className="glass-card hover:shadow-lg transition-transform hover:-translate-y-1 cursor-pointer"
              onClick={() => router.push('/analytics')}
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Monthly Consistency</CardTitle>
                <CardDescription>Target: 100% of daily habits</CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center">
                <div className="h-[180px] w-full relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={completionData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {completionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none">
                    <span className="text-3xl font-bold">{percentage}%</span>
                    <span className="text-xs text-muted-foreground">Done</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Achievements Teaser (Dynamic Streak) */}
            <Card
              className="glass-card bg-amber-50/50 border-amber-100 hover:shadow-lg transition-transform hover:-translate-y-1 cursor-pointer"
              onClick={() => router.push('/analytics')}
            >
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-amber-800">Current Streak</CardTitle>
                  <Trophy className="w-4 h-4 text-amber-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="font-bold text-lg">{streak} Days</p>
                  <div className="h-2 w-full bg-amber-200/50 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-500 transition-all duration-500"
                      style={{ width: `${Math.min(streak * 10, 100)}%` }} // Arbitrary progress to next milestone (10 days)
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">Keep it up!</p>
                </div>
              </CardContent>
            </Card>
          </div>

        </div>
      </div>
    </DashboardShell>
  )
}
