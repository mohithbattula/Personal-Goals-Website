"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell } from "recharts"

interface AnalyticsChartsProps {
    trendData: { date: string; value: number }[]
    pieData: { name: string; value: number; color: string }[]
    chartColor?: string
}

export function AnalyticsCharts({ trendData, pieData, chartColor = "#3b82f6" }: AnalyticsChartsProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Area Chart - Progress History */}
            <Card className="glass-card shadow-sm border border-slate-200">
                <CardHeader>
                    <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-500">Overview Monthly Progress</CardTitle>
                    <CardDescription>Daily completion count</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="h-[250px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={trendData}>
                                <defs>
                                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={chartColor} stopOpacity={0.3} />
                                        <stop offset="95%" stopColor={chartColor} stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis
                                    dataKey="date"
                                    fontSize={10}
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(val) => val.split('-')[2]}
                                    minTickGap={20}
                                />
                                <YAxis hide domain={[0, 'auto']} allowDecimals={false} />
                                <Tooltip
                                    contentStyle={{ background: 'rgba(255,255,255,0.9)', borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                    itemStyle={{ color: chartColor, fontWeight: 'bold' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="value"
                                    stroke={chartColor}
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorValue)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>

            {/* Donut Chart - Overall Completion */}
            <Card className="glass-card shadow-sm border border-slate-200">
                <CardHeader>
                    <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-500">Efficiency</CardTitle>
                    <CardDescription>Total success rate this month</CardDescription>
                </CardHeader>
                <CardContent className="flex items-center justify-center relative">
                    <div className="h-[250px] w-full max-w-[300px] relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={2}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {pieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>

                            </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                            <span className="text-4xl font-black text-slate-800">
                                {pieData[0]?.value}%
                            </span>
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Completed</span>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
