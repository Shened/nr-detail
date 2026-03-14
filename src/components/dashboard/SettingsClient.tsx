'use client'

import { useState } from 'react'

interface Schedule {
    id: string
    dayOfWeek: number
    startTime: string
    endTime: string
    isOpen: boolean
}

interface Business {
    id: string
    name: string
    slug: string
    description: string | null
    phone: string | null
    email: string | null
}

interface Props {
    business: Business
    schedules: Schedule[]
}

const DAY_NAMES = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']

const DEFAULT_SCHEDULES = DAY_NAMES.map((_, i) => ({
    dayOfWeek: i,
    startTime: '09:00',
    endTime: '18:00',
    isOpen: i !== 0,
}))

export default function SettingsClient({ business, schedules: initial }: Props) {
    const [bizLoading, setBizLoading] = useState(false)
    const [bizSuccess, setBizSuccess] = useState(false)
    const [bizError, setBizError] = useState<string | null>(null)

    const [schedules, setSchedules] = useState(() =>
        DEFAULT_SCHEDULES.map((def) => {
            const existing = initial.find((s) => s.dayOfWeek === def.dayOfWeek)
            return existing ?? { ...def, id: '' }
        })
    )
    const [schedLoading, setSchedLoading] = useState(false)
    const [schedSuccess, setSchedSuccess] = useState(false)

    async function handleBusiness(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setBizLoading(true)
        setBizSuccess(false)
        setBizError(null)

        const formData = new FormData(e.currentTarget)
        const res = await fetch('/api/business', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: formData.get('name'),
                slug: formData.get('slug'),
                description: formData.get('description'),
                phone: formData.get('phone'),
                email: formData.get('email'),
            }),
        })

        const data = await res.json()

        if (!res.ok) {
            setBizError(data.error ?? 'Erro ao guardar')
        } else {
            setBizSuccess(true)
        }
        setBizLoading(false)
    }

    async function handleSchedules(e: React.FormEvent) {
        e.preventDefault()
        setSchedLoading(true)
        setSchedSuccess(false)

        await fetch('/api/schedules', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ businessId: business.id, schedules }),
        })

        setSchedSuccess(true)
        setSchedLoading(false)
    }

    function updateSchedule(dayOfWeek: number, field: string, value: string | boolean) {
        setSchedules(schedules.map((s) =>
            s.dayOfWeek === dayOfWeek ? { ...s, [field]: value } : s
        ))
    }

    return (
        <div className="space-y-8 max-w-2xl">
            <div>
                <h1 className="text-2xl font-semibold tracking-tight">Configurações</h1>
                <p className="text-sm text-muted-foreground mt-1">Gere as informações do teu negócio</p>
            </div>

            <div className="bg-card border border-border rounded-xl p-6">
                <h2 className="text-sm font-semibold mb-5">Informações do negócio</h2>
                <form onSubmit={handleBusiness} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium">Nome</label>
                            <input
                                name="name"
                                defaultValue={business.name}
                                required
                                className="w-full h-10 px-3 rounded-lg border border-input bg-background text-sm outline-none focus:ring-2 focus:ring-ring transition"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium">Link público</label>
                            <div className="flex items-center h-10 rounded-lg border border-input bg-background overflow-hidden focus-within:ring-2 focus-within:ring-ring transition">
                                <span className="px-3 text-xs text-muted-foreground border-r border-input h-full flex items-center bg-muted">
                                    autobooking.pt/
                                </span>
                                <input
                                    name="slug"
                                    defaultValue={business.slug}
                                    required
                                    className="flex-1 px-3 text-sm outline-none bg-transparent"
                                />
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium">Telemóvel</label>
                            <input
                                name="phone"
                                defaultValue={business.phone ?? ''}
                                className="w-full h-10 px-3 rounded-lg border border-input bg-background text-sm outline-none focus:ring-2 focus:ring-ring transition"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium">Email</label>
                            <input
                                name="email"
                                type="email"
                                defaultValue={business.email ?? ''}
                                className="w-full h-10 px-3 rounded-lg border border-input bg-background text-sm outline-none focus:ring-2 focus:ring-ring transition"
                            />
                        </div>
                        <div className="space-y-1.5 sm:col-span-2">
                            <label className="text-sm font-medium">Descrição</label>
                            <textarea
                                name="description"
                                defaultValue={business.description ?? ''}
                                rows={3}
                                placeholder="Descreve o teu negócio..."
                                className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm outline-none focus:ring-2 focus:ring-ring transition resize-none"
                            />
                        </div>
                    </div>

                    {bizError && (
                        <div className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-lg">
                            {bizError}
                        </div>
                    )}
                    {bizSuccess && (
                        <div className="text-sm text-green-700 bg-green-50 px-3 py-2 rounded-lg">
                            Guardado com sucesso!
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={bizLoading}
                        className="h-9 px-4 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition disabled:opacity-50"
                    >
                        {bizLoading ? 'A guardar...' : 'Guardar alterações'}
                    </button>
                </form>
            </div>

            <div className="bg-card border border-border rounded-xl p-6">
                <h2 className="text-sm font-semibold mb-5">Horários de funcionamento</h2>
                <form onSubmit={handleSchedules} className="space-y-3">
                    {schedules.map((sched) => (
                        <div key={sched.dayOfWeek} className="flex items-center gap-4">
                            <div className="w-24 flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={sched.isOpen}
                                    onChange={(e) => updateSchedule(sched.dayOfWeek, 'isOpen', e.target.checked)}
                                    className="rounded"
                                />
                                <span className="text-sm">{DAY_NAMES[sched.dayOfWeek]}</span>
                            </div>
                            {sched.isOpen ? (
                                <div className="flex items-center gap-2">
                                    <input
                                        type="time"
                                        value={sched.startTime}
                                        onChange={(e) => updateSchedule(sched.dayOfWeek, 'startTime', e.target.value)}
                                        className="h-9 px-2 rounded-lg border border-input bg-background text-sm outline-none focus:ring-2 focus:ring-ring transition"
                                    />
                                    <span className="text-muted-foreground text-sm">—</span>
                                    <input
                                        type="time"
                                        value={sched.endTime}
                                        onChange={(e) => updateSchedule(sched.dayOfWeek, 'endTime', e.target.value)}
                                        className="h-9 px-2 rounded-lg border border-input bg-background text-sm outline-none focus:ring-2 focus:ring-ring transition"
                                    />
                                </div>
                            ) : (
                                <span className="text-sm text-muted-foreground">Fechado</span>
                            )}
                        </div>
                    ))}

                    {schedSuccess && (
                        <div className="text-sm text-green-700 bg-green-50 px-3 py-2 rounded-lg">
                            Horários guardados!
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={schedLoading}
                        className="h-9 px-4 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition disabled:opacity-50 mt-2"
                    >
                        {schedLoading ? 'A guardar...' : 'Guardar horários'}
                    </button>
                </form>
            </div>
        </div>
    )
}