"use client"

import { useState, useEffect } from "react"
import { DashboardShell } from "@/components/dashboard-shell"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Trash2, Plus, Target, Search, Edit2, Save, X, LayoutGrid, List } from "lucide-react"
import { useRouter } from "next/navigation"
import { cn } from "@/utils/cn"

type Habit = {
    id: number
    name: string
    target_per_month: number
    icon: string | null
    frequency: string[]
}

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

export default function HabitsPage() {
    const [habits, setHabits] = useState<Habit[]>([])
    const [loading, setLoading] = useState(true)
    const router = useRouter()

    // Create Form State
    const [newHabitName, setNewHabitName] = useState("")
    const [selectedDays, setSelectedDays] = useState<string[]>(DAYS) // Default all days

    // Search State
    const [searchQuery, setSearchQuery] = useState("")

    // Edit State
    const [editingId, setEditingId] = useState<number | null>(null)
    const [editName, setEditName] = useState("")

    // View Mode State
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

    useEffect(() => {
        fetchHabits()
    }, [])

    const fetchHabits = async () => {
        setLoading(true)
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            router.push("/login")
            return
        }

        const { data, error } = await supabase
            .from("habits")
            .select("*")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false })

        if (!error && data) {
            setHabits(data)
        }
        setLoading(false)
    }

    const toggleDay = (day: string) => {
        if (selectedDays.includes(day)) {
            setSelectedDays(selectedDays.filter(d => d !== day))
        } else {
            setSelectedDays([...selectedDays, day])
        }
    }

    const handleCreateHabit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newHabitName.trim()) return
        if (selectedDays.length === 0) {
            alert("Please select at least one day")
            return
        }

        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { error } = await supabase.from("habits").insert({
            user_id: user.id,
            name: newHabitName,
            target_per_month: selectedDays.length * 4, // Estimate
            frequency: selectedDays
        })

        if (!error) {
            setNewHabitName("")
            setSelectedDays(DAYS) // Reset to all
            fetchHabits()
        }
    }

    const handleDeleteHabit = async (id: number) => {
        if (!confirm("Are you sure?")) return
        const { error } = await supabase.from("habits").delete().eq("id", id)
        if (!error) {
            setHabits(habits.filter(h => h.id !== id))
        }
    }

    const startEditing = (habit: Habit) => {
        setEditingId(habit.id)
        setEditName(habit.name)
    }

    const handleUpdateHabit = async (id: number) => {
        if (!editName.trim()) return

        const { error } = await supabase
            .from("habits")
            .update({ name: editName })
            .eq("id", id)

        if (!error) {
            setHabits(habits.map(h => h.id === id ? { ...h, name: editName } : h))
            setEditingId(null)
        }
    }

    const filteredHabits = habits.filter(habit =>
        habit.name.toLowerCase().includes(searchQuery.toLowerCase())
    )

    return (
        <DashboardShell>
            <div className="space-y-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Manage Habits</h1>
                        <p className="text-muted-foreground">Create and configure your daily habits.</p>
                    </div>
                </div>

                {/* Create Habit Form */}
                <Card>
                    <CardHeader>
                        <CardTitle>Add New Habit</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleCreateHabit} className="flex flex-col gap-4">
                            <div className="flex gap-4">
                                <Input
                                    placeholder="e.g. Read for 30 mins"
                                    value={newHabitName}
                                    onChange={(e) => setNewHabitName(e.target.value)}
                                />
                                <Button type="submit">
                                    <Plus className="mr-2 h-4 w-4" /> Add
                                </Button>
                            </div>

                            {/* Day Selection */}
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="text-sm font-medium text-muted-foreground mr-2">Frequency:</span>
                                {DAYS.map(day => {
                                    const isSelected = selectedDays.includes(day)
                                    return (
                                        <button
                                            key={day}
                                            type="button"
                                            onClick={() => toggleDay(day)}
                                            className={cn(
                                                "w-8 h-8 rounded-full text-xs font-bold transition-all flex items-center justify-center border",
                                                isSelected
                                                    ? "bg-primary text-primary-foreground border-primary"
                                                    : "bg-muted text-muted-foreground border-transparent hover:border-slate-300"
                                            )}
                                        >
                                            {day.charAt(0)}
                                        </button>
                                    )
                                })}
                            </div>
                        </form>
                    </CardContent>
                </Card>

                {/* Search & View Toggle */}
                <div className="flex items-center gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search habits..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                    <div className="flex items-center gap-1 border p-1 rounded-md bg-white">
                        <Button
                            variant="ghost"
                            size="sm"
                            className={cn("h-8 w-8 p-0", viewMode === 'grid' && "bg-slate-100")}
                            onClick={() => setViewMode('grid')}
                        >
                            <LayoutGrid className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            className={cn("h-8 w-8 p-0", viewMode === 'list' && "bg-slate-100")}
                            onClick={() => setViewMode('list')}
                        >
                            <List className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                {/* Habits List/Grid */}
                <div className={cn(
                    "grid gap-6",
                    viewMode === 'grid' ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"
                )}>
                    {loading ? (
                        <p>Loading habits...</p>
                    ) : filteredHabits.length === 0 ? (
                        <div className="col-span-full text-center p-12 border-2 border-dashed rounded-lg">
                            <Target className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                            <h3 className="text-lg font-medium">No habits found</h3>
                            <p className="text-muted-foreground">Try creating a new one or adjusting your search.</p>
                        </div>
                    ) : filteredHabits.map((habit) => (
                        <Card key={habit.id} className={cn("group relative overflow-hidden transition-all hover:shadow-md", viewMode === 'list' && "flex flex-row items-center justify-between p-4")}>
                            {/* LIST VIEW LAYOUT */}
                            {viewMode === 'list' ? (
                                <>
                                    <div className="flex items-center gap-4 flex-1">
                                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                                            {habit.icon || <Target className="h-5 w-5" />}
                                        </div>
                                        {editingId === habit.id ? (
                                            <Input
                                                value={editName}
                                                onChange={(e) => setEditName(e.target.value)}
                                                className="h-8 font-medium max-w-[200px]"
                                                autoFocus
                                            />
                                        ) : (
                                            <div>
                                                <h3 className="font-bold text-base">{habit.name}</h3>
                                                <p className="text-xs text-muted-foreground">Target: {habit.target_per_month}/mo</p>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-6">
                                        <div className="hidden md:flex gap-1">
                                            {DAYS.map(day => (
                                                <span
                                                    key={day}
                                                    className={cn(
                                                        "text-[10px] w-4 h-4 rounded-full flex items-center justify-center border",
                                                        habit.frequency?.includes(day) || (!habit.frequency)
                                                            ? "bg-blue-100 text-blue-600 border-blue-200 font-bold"
                                                            : "text-slate-300 border-transparent bg-slate-50"
                                                    )}
                                                >
                                                    {day.charAt(0)}
                                                </span>
                                            ))}
                                        </div>

                                        <div className="flex items-center gap-1">
                                            {editingId === habit.id ? (
                                                <>
                                                    <Button size="sm" onClick={() => handleUpdateHabit(habit.id)} className="bg-green-600 hover:bg-green-700 text-white h-8 w-8 p-0"><Save className="w-4 h-4" /></Button>
                                                    <Button variant="ghost" size="sm" onClick={() => setEditingId(null)} className="h-8 w-8 p-0"><X className="w-4 h-4" /></Button>
                                                </>
                                            ) : (
                                                <>
                                                    <Button variant="ghost" size="icon" onClick={() => startEditing(habit)}><Edit2 className="h-4 w-4 text-slate-400 hover:text-slate-900" /></Button>
                                                    <Button variant="ghost" size="icon" onClick={() => handleDeleteHabit(habit.id)}><Trash2 className="h-4 w-4 text-slate-300 hover:text-red-600" /></Button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </>
                            ) : (
                                /* GRID VIEW LAYOUT (Original) */
                                <>
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        {editingId === habit.id ? (
                                            <Input
                                                value={editName}
                                                onChange={(e) => setEditName(e.target.value)}
                                                className="h-8 font-medium"
                                                autoFocus
                                            />
                                        ) : (
                                            <CardTitle className="text-lg font-medium truncate pr-4">
                                                {habit.name}
                                            </CardTitle>
                                        )}
                                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                                            {habit.icon || <Target className="h-4 w-4" />}
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-2">
                                            <div className="text-xs text-muted-foreground">
                                                Target: {habit.target_per_month} days / month
                                            </div>
                                            <div className="flex gap-1">
                                                {DAYS.map(day => (
                                                    <span
                                                        key={day}
                                                        className={cn(
                                                            "text-[10px] w-4 h-4 rounded-full flex items-center justify-center border",
                                                            habit.frequency?.includes(day) || (!habit.frequency) // default logic matches old data
                                                                ? "bg-blue-100 text-blue-600 border-blue-200 font-bold"
                                                                : "text-slate-300 border-transparent bg-slate-50"
                                                        )}
                                                    >
                                                        {day.charAt(0)}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </CardContent>
                                    <CardFooter className="bg-muted/50 p-3 flex justify-end gap-2">
                                        {editingId === habit.id ? (
                                            <>
                                                <Button
                                                    size="sm"
                                                    onClick={() => handleUpdateHabit(habit.id)}
                                                    className="bg-green-600 hover:bg-green-700 text-white"
                                                >
                                                    <Save className="w-4 h-4 mr-1" /> Save
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => setEditingId(null)}
                                                >
                                                    <X className="w-4 h-4 mr-1" /> Cancel
                                                </Button>
                                            </>
                                        ) : (
                                            <>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="text-slate-500 hover:text-slate-900 hover:bg-slate-200"
                                                    onClick={() => startEditing(habit)}
                                                >
                                                    <Edit2 className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="text-red-500 hover:text-red-700 hover:bg-red-100 dark:hover:bg-red-900/20"
                                                    onClick={() => handleDeleteHabit(habit.id)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </>
                                        )}
                                    </CardFooter>
                                </>
                            )}
                        </Card>
                    ))}
                </div>
            </div>
        </DashboardShell>
    )
}
