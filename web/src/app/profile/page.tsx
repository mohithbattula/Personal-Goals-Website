"use client"

import { useState, useEffect } from "react"
import { DashboardShell } from "@/components/dashboard-shell"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { User, Mail, Save, Loader2, Camera } from "lucide-react"
import { cn } from "@/utils/cn"

export default function ProfilePage() {
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [user, setUser] = useState<any>(null)
    const [profile, setProfile] = useState({
        full_name: "",
        website: "",
        avatar_url: ""
    })
    const [message, setMessage] = useState("")

    useEffect(() => {
        async function getProfile() {
            setLoading(true)
            const { data: { user } } = await supabase.auth.getUser()

            if (user) {
                setUser(user)

                let { data, error } = await supabase
                    .from('profiles')
                    .select(`full_name, website, avatar_url`)
                    .eq('id', user.id)
                    .single()

                if (data) {
                    setProfile({
                        full_name: data.full_name || "",
                        website: data.website || "",
                        avatar_url: data.avatar_url || ""
                    })
                }
            }
            setLoading(false)
        }
        getProfile()
    }, [])

    async function updateProfile(e: React.FormEvent) {
        e.preventDefault()
        setSaving(true)
        setMessage("")

        const { error } = await supabase.from('profiles').upsert({
            id: user?.id,
            full_name: profile.full_name,
            website: profile.website,
            avatar_url: profile.avatar_url,
            updated_at: new Date().toISOString(),
        })

        if (error) {
            setMessage("Error updating profile")
        } else {
            setMessage("Profile updated successfully")
        }
        setSaving(false)
    }

    if (loading) {
        return (
            <DashboardShell>
                <div className="flex items-center justify-center p-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            </DashboardShell>
        )
    }

    return (
        <DashboardShell>
            <div className="space-y-8 max-w-4xl mx-auto">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-slate-900">Profile Settings</h1>
                    <p className="text-muted-foreground mt-2">Manage your public profile and account details.</p>
                </div>

                <div className="grid gap-8 md:grid-cols-[1fr_2fr]">
                    {/* Sidebar / Avatar Card */}
                    <Card className="glass-card h-fit">
                        <CardContent className="pt-6 flex flex-col items-center text-center">
                            <div className="h-32 w-32 rounded-full bg-secondary mb-4 flex items-center justify-center relative overflow-hidden group border-4 border-white shadow-xl">
                                {profile.avatar_url ? (
                                    <img src={profile.avatar_url} alt="Avatar" className="h-full w-full object-cover" />
                                ) : (
                                    <User className="h-12 w-12 text-muted-foreground" />
                                )}
                            </div>
                            <h2 className="text-xl font-bold text-slate-900">{profile.full_name || "User"}</h2>
                            <p className="text-sm text-muted-foreground">{user?.email}</p>
                        </CardContent>
                    </Card>

                    {/* Edit Form */}
                    <Card className="glass-card">
                        <CardHeader>
                            <CardTitle>Account Details</CardTitle>
                            <CardDescription>Update your personal information.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={updateProfile} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700">Email Address</label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                        <Input value={user?.email} disabled className="pl-10 bg-slate-50 font-mono text-slate-500" />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700">Full Name</label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            value={profile.full_name}
                                            onChange={e => setProfile({ ...profile, full_name: e.target.value })}
                                            className="pl-10 font-medium"
                                            placeholder="Your Name"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700">Avatar URL</label>
                                    <div className="relative">
                                        <Camera className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            value={profile.avatar_url}
                                            onChange={e => setProfile({ ...profile, avatar_url: e.target.value })}
                                            className="pl-10 font-medium"
                                            placeholder="https://example.com/me.jpg"
                                        />
                                    </div>
                                </div>

                                {message && (
                                    <p className={cn("text-sm font-medium", message.includes("Error") ? "text-red-500" : "text-green-600")}>
                                        {message}
                                    </p>
                                )}

                                <div className="flex justify-end pt-4">
                                    <Button type="submit" className="font-bold min-w-[120px]" disabled={saving}>
                                        {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        {!saving && <Save className="mr-2 h-4 w-4" />}
                                        Save Changes
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>

            </div>
        </DashboardShell>
    )
}
