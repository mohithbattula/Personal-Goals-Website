"use client"

import { useState, useEffect } from "react"
import { DashboardShell } from "@/components/dashboard-shell"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Target, Plus, CheckCircle2, Circle, Trash2, Calendar } from "lucide-react"
import { cn } from "@/utils/cn"
import { format } from "date-fns"

type Goal = {
    id: number
    title: string
    description: string | null
    target_date: string | null
    status: 'pending' | 'in_progress' | 'completed'
}

export default function GoalsPage() {
    const [goals, setGoals] = useState<Goal[]>([])
    const [newGoal, setNewGoal] = useState({ title: '', target_date: '' })
    const [loading, setLoading] = useState(true)

    const fetchGoals = async () => {
        try {
            setLoading(true)
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            const { data, error } = await supabase
                .from('goals')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })

            if (error) throw error
            setGoals(data || [])
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchGoals()
    }, [])

    const handleCreateGoal = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newGoal.title) return

        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { error } = await supabase.from('goals').insert({
            user_id: user.id,
            title: newGoal.title,
            target_date: newGoal.target_date || null,
            status: 'pending'
        })

        if (!error) {
            setNewGoal({ title: '', target_date: '' })
            fetchGoals()
        }
    }

    const handleUpdateStatus = async (id: number, status: Goal['status']) => {
        // Optimistic update
        setGoals(prev => prev.map(g => g.id === id ? { ...g, status } : g))

        await supabase.from('goals').update({ status }).eq('id', id)
    }

    const handleDelete = async (id: number) => {
        if (!confirm("Delete this goal?")) return
        setGoals(prev => prev.filter(g => g.id !== id))
        await supabase.from('goals').delete().eq('id', id)
    }

    return (
        <DashboardShell>
            <div className="space-y-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Long-term Goals</h1>
                    <p className="text-muted-foreground">Keep your eyes on the prize.</p>
                </div>

                {/* Add Goal Form */}
                <Card className="glass-card">
                    <CardHeader>
                        <CardTitle className="text-lg">Set a New Goal</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleCreateGoal} className="flex flex-col md:flex-row gap-4 items-end">
                            <div className="flex-1 space-y-2 w-full">
                                <label className="text-sm font-medium">Goal Title</label>
                                <Input
                                    placeholder="e.g. Run a Marathon"
                                    value={newGoal.title}
                                    onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                                />
                            </div>
                            <div className="w-full md:w-48 space-y-2">
                                <label className="text-sm font-medium">Target Date</label>
                                <Input
                                    type="date"
                                    value={newGoal.target_date}
                                    onChange={(e) => setNewGoal({ ...newGoal, target_date: e.target.value })}
                                />
                            </div>
                            <Button type="submit" className="w-full md:w-auto">
                                <Plus className="mr-2 h-4 w-4" /> Add Goal
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Goals List */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {loading ? (
                        <p className="p-4">Loading goals...</p>
                    ) : goals.length === 0 ? (
                        <div className="col-span-full text-center p-12 border-2 border-dashed rounded-xl bg-white/50">
                            <Target className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                            <p className="text-muted-foreground">No active goals found. Set one above!</p>
                        </div>
                    ) : (
                        goals.map((goal) => (
                            <Card key={goal.id} className={cn(
                                "glass-card transition-all",
                                goal.status === 'completed' ? "bg-green-50/50 border-green-100" : ""
                            )}>
                                <CardHeader className="flex flex-row items-start justify-between pb-2">
                                    <div>
                                        <CardTitle className={cn(
                                            "text-lg",
                                            goal.status === 'completed' && "line-through text-muted-foreground"
                                        )}>{goal.title}</CardTitle>
                                        {goal.target_date && (
                                            <CardDescription className="flex items-center mt-1">
                                                <Calendar className="mr-1 h-3 w-3" />
                                                Target: {format(new Date(goal.target_date), 'MMM do, yyyy')}
                                            </CardDescription>
                                        )}
                                    </div>
                                    <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-red-500" onClick={() => handleDelete(goal.id)}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex gap-2">
                                        {goal.status !== 'completed' && (
                                            <Button size="sm" variant="outline" className="w-full border-green-200 hover:bg-green-50 hover:text-green-600" onClick={() => handleUpdateStatus(goal.id, 'completed')}>
                                                <CheckCircle2 className="mr-2 h-4 w-4" /> Mark Complete
                                            </Button>
                                        )}
                                        {goal.status === 'completed' && (
                                            <Button size="sm" variant="outline" className="w-full" onClick={() => handleUpdateStatus(goal.id, 'in_progress')}>
                                                <Circle className="mr-2 h-4 w-4" /> Mark Incomplete
                                            </Button>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>
            </div>
        </DashboardShell>
    )
}
