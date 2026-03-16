'use client'

import { useState } from 'react'
import { Building2, Clock, Image, MapPin, Phone, Mail, Link as LinkIcon } from 'lucide-react'

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
    address: string | null
    logoUrl: string | null
    coverUrl: string | null
    bookingView: 'SLOTS' | 'TIMELINE'
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
    isOpen: i !== 0 && i !== 6,
}))


type Tab = 'info' | 'hours' | 'images'

export default function SettingsClient({ business, schedules: initial }: Props) {
    const [activeTab, setActiveTab] = useState<Tab>('info')
    const [bizLoading, setBizLoading] = useState(false)
    const [bizSuccess, setBizSuccess] = useState(false)
    const [bizError, setBizError] = useState<string | null>(null)

    const [avatarUrl, setAvatarUrl] = useState<string | null>(business.logoUrl ?? null)
    const [coverUrl, setCoverUrl] = useState<string | null>(business.coverUrl ?? null)
    const [uploadingAvatar, setUploadingAvatar] = useState(false)
    const [uploadingCover, setUploadingCover] = useState(false)

    const [bizView, setBizView] = useState<'SLOTS' | 'TIMELINE'>(business.bookingView)

    const [schedules, setSchedules] = useState(() =>
        DEFAULT_SCHEDULES.map((def) => {
            const existing = initial.find((s) => s.dayOfWeek === def.dayOfWeek)
            return existing ?? { ...def, id: '' }
        })
    )
    const [schedLoading, setSchedLoading] = useState(false)
    const [schedSuccess, setSchedSuccess] = useState(false)

    async function handleImageUpload(file: File, type: 'avatar' | 'cover') {
        const setter = type === 'avatar' ? setUploadingAvatar : setUploadingCover
        setter(true)

        const formData = new FormData()
        formData.append('file', file)
        formData.append('type', type)

        const res = await fetch('/api/upload', {
            method: 'POST',
            body: formData,
        })

        const data = await res.json()

        if (!res.ok) {
            setter(false)
            return
        }

        const newAvatarUrl = type === 'avatar' ? data.url : avatarUrl
        const newCoverUrl = type === 'cover' ? data.url : coverUrl

        if (type === 'avatar') setAvatarUrl(data.url)
        else setCoverUrl(data.url)

        setter(false)

        await fetch('/api/business', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: business.name,
                slug: business.slug,
                description: business.description,
                phone: business.phone,
                email: business.email,
                address: business.address,
                logoUrl: newAvatarUrl,
                coverUrl: newCoverUrl,
            }),
        })
    }

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
                address: formData.get('address'),
                logoUrl: avatarUrl,
                coverUrl: coverUrl,
                bookingView: bizView,
            }),
        })

        const data = await res.json()
        if (!res.ok) {
            setBizError(data.error ?? 'Erro ao guardar')
        } else {
            setBizSuccess(true)
            setTimeout(() => setBizSuccess(false), 3000)
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
        setTimeout(() => setSchedSuccess(false), 3000)
        setSchedLoading(false)
    }

    function updateSchedule(dayOfWeek: number, field: string, value: string | boolean) {
        setSchedules(schedules.map((s) =>
            s.dayOfWeek === dayOfWeek ? { ...s, [field]: value } : s
        ))
    }

    const tabs = [
        { id: 'info' as Tab, label: 'Informações', icon: Building2 },
        { id: 'hours' as Tab, label: 'Horários', icon: Clock },
        { id: 'images' as Tab, label: 'Imagens', icon: Image },
    ]

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div>
                <h1 className="text-2xl font-semibold tracking-tight">Configurações</h1>
                <p className="text-sm text-muted-foreground mt-1">Gere as informações do teu negócio</p>
            </div>

            <div className="flex gap-1 bg-muted p-1 rounded-xl">
                {tabs.map((tab) => {
                    const Icon = tab.icon
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex-1 flex items-center justify-center gap-2 h-9 rounded-lg text-sm font-medium transition ${activeTab === tab.id
                                ? 'bg-background text-foreground shadow-sm'
                                : 'text-muted-foreground hover:text-foreground'
                                }`}
                        >
                            <Icon size={14} />
                            {tab.label}
                        </button>
                    )
                })}
            </div>

            {activeTab === 'info' && (
                <div className="bg-card border border-border rounded-xl p-6">
                    <form onSubmit={handleBusiness} className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium flex items-center gap-2">
                                <Building2 size={13} className="text-muted-foreground" /> Nome do negócio
                            </label>
                            <input
                                name="name"
                                defaultValue={business.name}
                                required
                                className="w-full h-10 px-3 rounded-lg border border-input bg-background text-sm outline-none focus:ring-2 focus:ring-ring transition"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-sm font-medium flex items-center gap-2">
                                <LinkIcon size={13} className="text-muted-foreground" /> Link público
                            </label>
                            <div className="flex items-center h-10 rounded-lg border border-input bg-background overflow-hidden focus-within:ring-2 focus-within:ring-ring transition">
                                <span className="px-3 text-xs text-muted-foreground border-r border-input h-full flex items-center bg-muted whitespace-nowrap">
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

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium flex items-center gap-2">
                                    <Phone size={13} className="text-muted-foreground" /> Telemóvel
                                </label>
                                <input
                                    name="phone"
                                    defaultValue={business.phone ?? ''}
                                    placeholder="+351 9xx xxx xxx"
                                    className="w-full h-10 px-3 rounded-lg border border-input bg-background text-sm outline-none focus:ring-2 focus:ring-ring transition"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium flex items-center gap-2">
                                    <Mail size={13} className="text-muted-foreground" /> Email
                                </label>
                                <input
                                    name="email"
                                    type="email"
                                    defaultValue={business.email ?? ''}
                                    placeholder="email@exemplo.com"
                                    className="w-full h-10 px-3 rounded-lg border border-input bg-background text-sm outline-none focus:ring-2 focus:ring-ring transition"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-sm font-medium flex items-center gap-2">
                                <MapPin size={13} className="text-muted-foreground" /> Morada
                            </label>
                            <input
                                name="address"
                                defaultValue={business.address ?? ''}
                                placeholder="Ex: Rua de exemplo, 123, Porto"
                                className="w-full h-10 px-3 rounded-lg border border-input bg-background text-sm outline-none focus:ring-2 focus:ring-ring transition"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-sm font-medium">Descrição</label>
                            <textarea
                                name="description"
                                defaultValue={business.description ?? ''}
                                rows={3}
                                placeholder="Descreve o teu negócio..."
                                className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm outline-none focus:ring-2 focus:ring-ring transition resize-none"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Vista de marcações</label>
                            <div className="grid grid-cols-2 gap-3">
                                {(['SLOTS', 'TIMELINE'] as const).map((view) => (
                                    <button
                                        key={view}
                                        type="button"
                                        onClick={() => setBizView(view)}
                                        className={`p-3 rounded-xl border text-left transition ${bizView === view
                                            ? 'border-primary bg-primary/5'
                                            : 'border-border hover:border-primary/50'
                                            }`}
                                    >
                                        <p className="text-sm font-medium">
                                            {view === 'SLOTS' ? 'Horários fixos' : 'Vista Timeline'}
                                        </p>
                                        <p className="text-xs text-muted-foreground mt-0.5">
                                            {view === 'SLOTS' ? 'Calendário por slots fixos' : 'Calendário de horários flexíveis'}
                                        </p>
                                    </button>
                                ))}
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
                            className="h-9 px-5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition disabled:opacity-50"
                        >
                            {bizLoading ? 'A guardar...' : 'Guardar alterações'}
                        </button>
                    </form>
                </div>
            )}

            {activeTab === 'hours' && (
                <div className="bg-card border border-border rounded-xl p-6">
                    <form onSubmit={handleSchedules} className="space-y-3">
                        {schedules.map((sched) => (
                            <div key={sched.dayOfWeek} className="flex items-center gap-4 py-1">
                                <div className="w-28 flex items-center gap-2.5">
                                    <input
                                        type="checkbox"
                                        checked={sched.isOpen}
                                        onChange={(e) => updateSchedule(sched.dayOfWeek, 'isOpen', e.target.checked)}
                                        className="rounded"
                                    />
                                    <span className={`text-sm ${sched.isOpen ? 'text-foreground' : 'text-muted-foreground'}`}>
                                        {DAY_NAMES[sched.dayOfWeek]}
                                    </span>
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
                            <div className="text-sm text-green-700 bg-green-50 px-3 py-2 rounded-lg mt-2">
                                Horários guardados!
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={schedLoading}
                            className="h-9 px-5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition disabled:opacity-50 mt-2"
                        >
                            {schedLoading ? 'A guardar...' : 'Guardar horários'}
                        </button>
                    </form>
                </div>
            )}

            {activeTab === 'images' && (
                <div className="bg-card border border-border rounded-xl p-6 space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Foto de capa</label>
                        <p className="text-xs text-muted-foreground">Aparece no topo da página do teu negócio. Recomendado 1200x400px.</p>
                        <div
                            className="relative h-40 rounded-xl overflow-hidden bg-muted border-2 border-dashed border-border flex items-center justify-center cursor-pointer hover:border-primary/50 transition"
                            onClick={() => document.getElementById('cover-input')?.click()}
                        >
                            {coverUrl ? (
                                <img src={coverUrl} alt="Capa" className="w-full h-full object-cover" />
                            ) : (
                                <div className="text-center space-y-1">
                                    <p className="text-sm text-muted-foreground">Clica para fazer upload</p>
                                    <p className="text-xs text-muted-foreground">JPG, PNG até 5MB</p>
                                </div>
                            )}
                            {uploadingCover && (
                                <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                                    <p className="text-sm font-medium">A carregar...</p>
                                </div>
                            )}
                        </div>
                        <input
                            id="cover-input"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                                const file = e.target.files?.[0]
                                if (file) handleImageUpload(file, 'cover')
                            }}
                        />
                        {coverUrl && (
                            <button
                                type="button"
                                onClick={() => setCoverUrl(null)}
                                className="text-xs text-destructive hover:underline"
                            >
                                Remover foto de capa
                            </button>
                        )}
                    </div>

                    <div className="border-t border-border pt-6 space-y-2">
                        <label className="text-sm font-medium">Logo / Foto de perfil</label>
                        <p className="text-xs text-muted-foreground">Aparece como avatar do negócio. Recomendado 400x400px.</p>
                        <div className="flex items-center gap-4">
                            <div
                                className="relative w-24 h-24 rounded-2xl overflow-hidden bg-muted border-2 border-dashed border-border flex items-center justify-center cursor-pointer hover:border-primary/50 transition flex-shrink-0"
                                onClick={() => document.getElementById('avatar-input')?.click()}
                            >
                                {avatarUrl ? (
                                    <img src={avatarUrl} alt="Logo" className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-3xl font-bold text-muted-foreground">
                                        {business.name.charAt(0)}
                                    </span>
                                )}
                                {uploadingAvatar && (
                                    <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                                        <p className="text-xs font-medium">...</p>
                                    </div>
                                )}
                            </div>
                            <div className="space-y-2">
                                <button
                                    type="button"
                                    onClick={() => document.getElementById('avatar-input')?.click()}
                                    className="h-9 px-4 border border-border rounded-lg text-sm font-medium hover:bg-muted transition block"
                                >
                                    {uploadingAvatar ? 'A carregar...' : 'Alterar logo'}
                                </button>
                                {avatarUrl && (
                                    <button
                                        type="button"
                                        onClick={() => setAvatarUrl(null)}
                                        className="text-xs text-destructive hover:underline block"
                                    >
                                        Remover logo
                                    </button>
                                )}
                            </div>
                        </div>
                        <input
                            id="avatar-input"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                                const file = e.target.files?.[0]
                                if (file) handleImageUpload(file, 'avatar')
                            }}
                        />
                    </div>
                </div>
            )}
        </div>
    )
}