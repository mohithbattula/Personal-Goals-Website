"use client"

import { useDragControls, Reorder } from "framer-motion"
import { cn } from "@/utils/cn"
import { Check, GripVertical } from "lucide-react"
import { Habit } from "@/hooks/use-habits"

interface HabitItemProps {
    habit: Habit
    onToggle: (id: number, status: boolean) => void
}

export function HabitItem({ habit, onToggle }: HabitItemProps) {
    const controls = useDragControls()

    return (
        <Reorder.Item
            value={habit}
            dragListener={false}
            dragControls={controls}
            className="relative"
        >
            <div
                className={cn(
                    "group flex items-center justify-between p-4 rounded-xl border transition-all duration-300 bg-white hover:border-primary/50 hover:shadow-md select-none"
                )}
            >
                {/* Clickable Area for Toggling */}
                <div
                    className="flex items-center gap-4 flex-1 cursor-pointer"
                    onClick={() => onToggle(habit.id, !!habit.completed)}
                >
                    <div
                        className={cn(
                            "w-6 h-6 rounded-md border-2 flex items-center justify-center transition-colors",
                            habit.completed
                                ? "bg-primary border-primary"
                                : "border-slate-300 group-hover:border-primary"
                        )}
                    >
                        {habit.completed && <Check className="w-4 h-4 text-white" />}
                    </div>
                    <div>
                        <h3 className={cn(
                            "font-medium bg-transparent outline-none transition-all",
                            habit.completed ? "text-muted-foreground line-through" : "text-foreground"
                        )}>
                            {habit.name}
                        </h3>
                    </div>
                </div>

                {/* Right Side: Stats + Icon + Drag Handle */}
                <div className="flex items-center gap-6">
                    {/* Stats */}
                    <div className="flex items-center gap-3 text-sm">
                        <div className="flex items-center gap-1 text-orange-500" title="Current Streak">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                                <path fillRule="evenodd" d="M12.963 2.286a.75.75 0 00-1.071-.136 9.742 9.742 0 00-3.539 6.177A7.547 7.547 0 016.648 6.61a.75.75 0 00-1.152-.082A9 9 0 1015.68 4.534a7.46 7.46 0 01-2.717-2.248zM15.75 14.25a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" clipRule="evenodd" />
                            </svg>
                            <span className="font-bold">{habit.current_streak || 0}</span>
                        </div>
                        <div className="flex items-center gap-1 text-yellow-500" title="Best Streak">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                                <path fillRule="evenodd" d="M5.166 2.621v.858c-1.035.148-2.059.33-3.071.543a.75.75 0 00-.584.859 6.753 6.753 0 006.138 5.6 6.73 6.73 0 002.743 1.356c.68.09 1.36.09 2.04 0a6.73 6.73 0 002.743-1.356 6.753 6.753 0 006.138-5.6.75.75 0 00-.584-.859 29.803 29.803 0 00-3.07-.543v-.858a2.25 2.25 0 00-2.25-2.25h-8a2.25 2.25 0 00-2.25 2.25zM6.666 4.121v.053a28.32 28.32 0 002.166.415V3.75a.75.75 0 01.75-.75h4.5a.75.75 0 01.75.75v.839c.732-.12 1.456-.26 2.166-.415V4.12A.75.75 0 0016.166 3.37h-8a.75.75 0 00-.75.75zM10.5 13.5a1.5 1.5 0 011.5-1.5 1.5 1.5 0 11-1.5 1.5zm3.75 4.5a2.25 2.25 0 10-4.5 0 2.25 2.25 0 004.5 0z" clipRule="evenodd" />
                            </svg>
                            <span className="font-medium">{habit.longest_streak || 0}</span>
                        </div>
                    </div>

                    {habit.icon && <span className="text-xl">{habit.icon}</span>}

                    {/* Drag Handle - STRICTLY for dragging */}
                    <div
                        onPointerDown={(e) => controls.start(e)}
                        className="text-slate-300 hover:text-slate-600 cursor-grab active:cursor-grabbing p-1 touch-none"
                    >
                        <GripVertical className="w-5 h-5" />
                    </div>
                </div>
            </div>
        </Reorder.Item>
    )
}
