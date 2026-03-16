'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight, Check, Clock, Euro } from 'lucide-react'

interface Service {
    id: string
    name: string
    description: string | null
    duration: number
    price: number
}

interface Business {
    id: string
    name: string
    slug: string
}

interface Props {
    business: Business
    services: Service[]
}

const DAY_NAMES_SHORT = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
const INTERVAL = 15
const CELL_HEIGHT = 16

function timeToMinutes(time: string): number {
    const [h, m] = time.split(':').map(Number)
    return h * 60 + m
}

function minutesToTime(minutes: number): string {
    return `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`
}

function getWeekStart(date: Date): Date {
    const d = new Date(date)
    const day = d.getDay()
    d.setDate(d.getDate() - day + 1)
    d.setHours(0, 0, 0, 0)
    return d
}

function addDays(date: Date, days: number): Date {
    const d = new Date(date)
    d.setDate(d.getDate() + days)
    return d
}

export default function TimelineBookingForm({ business, services }: Props) {
    const [step, setStep] = useState(1)
    const [selectedService, setSelectedService] = useState<Service | null>(null)
    const [weekStart, setWeekStart] = useState(() => getWeekStart(new Date()))
    const [availability, setAvailability] = useState<Record<string, {
        scheduleStart: number
        scheduleEnd: number
        takenBlocks: { start: number; end: number }[]
    }>>({})
    const [displayStart, setDisplayStart] = useState(8 * 60)
    const [displayEnd, setDisplayEnd] = useState(18 * 60)
    const [selectedDateTime, setSelectedDateTime] = useState<{ date: Date; startMin: number } | null>(null)
    const [loadingWeek, setLoadingWeek] = useState(false)
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [form, setForm] = useState({ name: '', phone: '', email: '', notes: '' })

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))

    async function loadWeekAvailability(start: Date, service: Service) {
        setLoadingWeek(true)
        setAvailability({})
        setSelectedDateTime(null)

        const results: typeof availability = {}

        await Promise.all(
            Array.from({ length: 7 }, (_, i) => addDays(start, i)).map(async (date) => {
                const dateStr = date.toISOString().split('T')[0]
                const res = await fetch(
                    `/api/bookings/availability?businessId=${business.id}&date=${dateStr}&duration=${service.duration}`
                )
                const data = await res.json()

                if (data.slots && data.slots.length > 0) {
                    results[dateStr] = {
                        scheduleStart: timeToMinutes(data.slots[0]),
                        scheduleEnd: timeToMinutes(data.slots[data.slots.length - 1]) + service.duration,
                        takenBlocks: (data.takenSlots ?? []).map((t: string) => ({
                            start: timeToMinutes(t),
                            end: timeToMinutes(t) + service.duration,
                        })),
                    }
                } else {
                    results[dateStr] = { scheduleStart: 0, scheduleEnd: 0, takenBlocks: [] }
                }
            })
        )

        const allStarts = Object.values(results)
            .filter((d) => d.scheduleEnd > 0)
            .map((d) => d.scheduleStart)

        const allEnds = Object.values(results)
            .filter((d) => d.scheduleEnd > 0)
            .map((d) => d.scheduleEnd)

        if (allStarts.length > 0) {
            setDisplayStart(Math.min(...allStarts))
            setDisplayEnd(Math.max(...allEnds))
        }

        setAvailability(results)
        setLoadingWeek(false)
    }

    function handleServiceSelect(service: Service) {
        setSelectedService(service)
        setSelectedDateTime(null)
        loadWeekAvailability(weekStart, service)
    }

    function prevWeek() {
        const newStart = addDays(weekStart, -7)
        setWeekStart(newStart)
        if (selectedService) loadWeekAvailability(newStart, selectedService)
    }

    function nextWeek() {
        const newStart = addDays(weekStart, 7)
        setWeekStart(newStart)
        if (selectedService) loadWeekAvailability(newStart, selectedService)
    }

    function isAvailable(date: Date, startMin: number): boolean {
        if (!selectedService) return false
        const dateStr = date.toISOString().split('T')[0]
        const dayData = availability[dateStr]
        if (!dayData || dayData.scheduleEnd === 0) return false
        const endMin = startMin + selectedService.duration
        if (startMin < dayData.scheduleStart || endMin > dayData.scheduleEnd) return false
        return !dayData.takenBlocks.some((b) => startMin < b.end && endMin > b.start)
    }

    function isTaken(date: Date, startMin: number): boolean {
        const dateStr = date.toISOString().split('T')[0]
        const dayData = availability[dateStr]
        if (!dayData) return false
        return dayData.takenBlocks.some((b) => startMin >= b.start && startMin < b.end)
    }

    function isInSchedule(date: Date, startMin: number): boolean {
        const dateStr = date.toISOString().split('T')[0]
        const dayData = availability[dateStr]
        if (!dayData || dayData.scheduleEnd === 0) return false
        return startMin >= dayData.scheduleStart && startMin < dayData.scheduleEnd
    }

    function isSelected(date: Date, startMin: number): boolean {
        if (!selectedDateTime || !selectedService) return false
        return (
            selectedDateTime.date.toDateString() === date.toDateString() &&
            startMin >= selectedDateTime.startMin &&
            startMin < selectedDateTime.startMin + selectedService.duration
        )
    }

    const totalMinutes = displayEnd - displayStart
    const hourLabels = Array.from(
        { length: Math.ceil(totalMinutes / 60) },
        (_, i) => displayStart + i * 60
    )

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        if (!selectedService || !selectedDateTime) return
        setLoading(true)
        setError(null)

        const startTime = minutesToTime(selectedDateTime.startMin)
        const endTime = minutesToTime(selectedDateTime.startMin + selectedService.duration)

        const d = selectedDateTime.date
        const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

        const res = await fetch('/api/bookings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                businessId: business.id,
                serviceId: selectedService.id,
                date: new Date(`${dateStr}T12:00:00.000Z`).toISOString(),
                startTime,
                endTime,
                customerName: form.name,
                customerPhone: form.phone,
                customerEmail: form.email || '',
                notes: form.notes,
            }),
        })

        if (!res.ok) {
            const text = await res.text()
            setError(text || 'Erro ao criar marcação')
            setLoading(false)
            return
        }

        const data = await res.json()
        setSuccess(true)
        setLoading(false)
    }

    if (success) {
        return (
            <div className="bg-card border border-border rounded-2xl p-10 text-center">
                <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                    <Check size={24} className="text-green-600" />
                </div>
                <h2 className="text-xl font-semibold">Marcação confirmada!</h2>
                <p className="text-muted-foreground text-sm mt-2">
                    {form.name}, a tua marcação de <strong>{selectedService?.name}</strong> está marcada
                    para {selectedDateTime?.date.toLocaleDateString('pt-PT', { weekday: 'long', day: '2-digit', month: 'long' })} às {selectedDateTime ? minutesToTime(selectedDateTime.startMin) : ''}.
                </p>
                <div className="flex flex-col sm:flex-row gap-2 mt-6 justify-center">
                    <button
                        onClick={() => {
                            setStep(1)
                            setSelectedService(null)
                            setSelectedDateTime(null)
                            setAvailability({})
                            setForm({ name: '', phone: '', email: '', notes: '' })
                            setSuccess(false)
                        }}
                        className="h-10 px-6 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition"
                    >
                        Nova marcação
                    </button>
                    <a href="/" className="h-10 px-6 border border-border rounded-lg text-sm font-medium hover:bg-muted transition flex items-center justify-center">
                        Voltar ao início
                    </a>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2 mb-6">
                {[1, 2, 3].map((s) => (
                    <div key={s} className="flex items-center gap-2 flex-1">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0 transition-colors ${step > s || step === s ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                            }`}>
                            {step > s ? <Check size={12} /> : s}
                        </div>
                        <span className={`text-xs hidden sm:block ${step === s ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                            {s === 1 ? 'Serviço' : s === 2 ? 'Data & Hora' : 'Os teus dados'}
                        </span>
                        {s < 3 && <div className={`flex-1 h-px ${step > s ? 'bg-primary' : 'bg-border'}`} />}
                    </div>
                ))}
            </div>

            {step === 1 && (
                <div className="space-y-3">
                    <h2 className="text-sm font-semibold">Escolhe o serviço</h2>
                    {services.map((service) => (
                        <button
                            key={service.id}
                            onClick={() => handleServiceSelect(service)}
                            className={`w-full text-left p-4 rounded-xl border transition ${selectedService?.id === service.id
                                ? 'border-primary bg-primary/5'
                                : 'border-border bg-card hover:border-primary/50'
                                }`}
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium">{service.name}</p>
                                    {service.description && (
                                        <p className="text-xs text-muted-foreground mt-0.5">{service.description}</p>
                                    )}
                                    <div className="flex items-center gap-3 mt-1.5">
                                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                            <Clock size={11} /> {service.duration} min
                                        </span>
                                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                            <Euro size={11} /> {service.price.toFixed(2)}
                                        </span>
                                    </div>
                                </div>
                                {selectedService?.id === service.id && (
                                    <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                                        <Check size={11} className="text-primary-foreground" />
                                    </div>
                                )}
                            </div>
                        </button>
                    ))}
                    <button
                        onClick={() => setStep(2)}
                        disabled={!selectedService}
                        className="w-full h-11 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:opacity-90 transition disabled:opacity-40 flex items-center justify-center gap-2 mt-2"
                    >
                        Continuar <ChevronRight size={15} />
                    </button>
                </div>
            )}

            {step === 2 && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-sm font-semibold">Escolhe o dia e hora</h2>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={prevWeek}
                                disabled={weekStart <= today}
                                className="w-8 h-8 rounded-lg border border-border flex items-center justify-center hover:bg-muted transition disabled:opacity-30"
                            >
                                <ChevronLeft size={14} />
                            </button>
                            <span className="text-xs text-muted-foreground">
                                {weekStart.toLocaleDateString('pt-PT', { day: '2-digit', month: 'short' })} —{' '}
                                {addDays(weekStart, 6).toLocaleDateString('pt-PT', { day: '2-digit', month: 'short' })}
                            </span>
                            <button
                                onClick={nextWeek}
                                className="w-8 h-8 rounded-lg border border-border flex items-center justify-center hover:bg-muted transition"
                            >
                                <ChevronRight size={14} />
                            </button>
                        </div>
                    </div>

                    <div className="bg-card border border-border rounded-xl overflow-hidden">
                        {loadingWeek ? (
                            <div className="p-8 text-center text-sm text-muted-foreground">
                                A carregar disponibilidade...
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <div style={{ minWidth: '500px' }}>
                                    <div className="grid border-b border-border" style={{ gridTemplateColumns: '48px repeat(7, 1fr)' }}>
                                        <div className="border-r border-border" />
                                        {weekDays.map((date, i) => {
                                            const isPast = date < today
                                            const isToday = date.toDateString() === new Date().toDateString()
                                            return (
                                                <div
                                                    key={i}
                                                    className={`py-2 text-center border-r border-border last:border-r-0 ${isPast ? 'opacity-40' : ''}`}
                                                >
                                                    <p className="text-xs text-muted-foreground">{DAY_NAMES_SHORT[date.getDay()]}</p>
                                                    <p className={`text-sm font-medium mt-0.5 ${isToday ? 'text-primary' : ''}`}>
                                                        {date.getDate()}
                                                    </p>
                                                </div>
                                            )
                                        })}
                                    </div>

                                    <div
                                        className="relative"
                                        style={{ height: `${totalMinutes / INTERVAL * CELL_HEIGHT}px` }}
                                    >
                                        <div className="absolute inset-0 grid" style={{ gridTemplateColumns: '48px repeat(7, 1fr)' }}>
                                            <div className="border-r border-border relative">
                                                {hourLabels.map((totalMin, i) => {
                                                    const h = Math.floor(totalMin / 60)
                                                    return (
                                                        <div
                                                            key={h}
                                                            className="absolute text-xs text-muted-foreground pr-2 text-right w-full"
                                                            style={{ top: `${i * 60 / INTERVAL * CELL_HEIGHT - 7}px` }}
                                                        >
                                                            {`${String(h).padStart(2, '0')}:00`}
                                                        </div>
                                                    )
                                                })}
                                            </div>

                                            {weekDays.map((date, di) => {
                                                const isPast = date < today
                                                const dateStr = date.toISOString().split('T')[0]
                                                const dayData = availability[dateStr]
                                                const slots: number[] = []
                                                for (let m = displayStart; m < displayEnd; m += INTERVAL) {
                                                    slots.push(m)
                                                }

                                                return (
                                                    <div
                                                        key={di}
                                                        className={`border-r border-border last:border-r-0 relative ${isPast ? 'opacity-40 pointer-events-none' : ''}`}
                                                    >
                                                        {slots.map((startMin) => {
                                                            const inSched = isInSchedule(date, startMin)
                                                            const taken = isTaken(date, startMin)
                                                            const sel = isSelected(date, startMin)
                                                            const avail = isAvailable(date, startMin)
                                                            const top = (startMin - displayStart) / INTERVAL * CELL_HEIGHT

                                                            return (
                                                                <div
                                                                    key={startMin}
                                                                    style={{ top: `${top}px`, height: `${CELL_HEIGHT}px` }}
                                                                    className={`absolute left-0 right-0 border-b border-border/20 transition-colors ${sel ? 'bg-primary/25' :
                                                                        taken ? 'bg-red-50' :
                                                                            inSched && avail ? 'hover:bg-primary/10 cursor-pointer' :
                                                                                inSched ? 'bg-muted/30' :
                                                                                    'bg-muted/50'
                                                                        }`}
                                                                    onClick={() => {
                                                                        if (avail && !isPast) {
                                                                            setSelectedDateTime({ date, startMin })
                                                                        }
                                                                    }}
                                                                />
                                                            )
                                                        })}

                                                        {dayData?.takenBlocks.map((block, bi) => {
                                                            const topPx = (block.start - displayStart) / INTERVAL * CELL_HEIGHT
                                                            if (topPx < 0) return null
                                                            return (
                                                                <div
                                                                    key={bi}
                                                                    style={{
                                                                        top: `${topPx}px`,
                                                                        height: `${(block.end - block.start) / INTERVAL * CELL_HEIGHT}px`,
                                                                    }}
                                                                    className="absolute left-0.5 right-0.5 bg-red-100 border border-red-200 rounded pointer-events-none z-10 flex items-center px-1"
                                                                >
                                                                    <span className="text-xs text-red-500 font-medium truncate">Ocupado</span>
                                                                </div>
                                                            )
                                                        })}

                                                        {selectedDateTime?.date.toDateString() === date.toDateString() && selectedService && (
                                                            <div
                                                                style={{
                                                                    top: `${(selectedDateTime.startMin - displayStart) / INTERVAL * CELL_HEIGHT}px`,
                                                                    height: `${selectedService.duration / INTERVAL * CELL_HEIGHT}px`,
                                                                }}
                                                                className="absolute left-0.5 right-0.5 bg-primary/30 border-2 border-primary rounded pointer-events-none z-20 flex items-center px-1"
                                                            >
                                                                <span className="text-xs text-primary font-medium truncate">
                                                                    {minutesToTime(selectedDateTime.startMin)}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                )
                                            })}
                                        </div>

                                        {hourLabels.map((_, i) => (
                                            <div
                                                key={i}
                                                className="absolute left-0 right-0 border-t border-border/30"
                                                style={{ top: `${i * 60 / INTERVAL * CELL_HEIGHT}px` }}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {selectedDateTime && selectedService && (
                        <div className="bg-primary/5 border border-primary/20 rounded-xl px-4 py-3 text-sm">
                            <span className="font-medium">Selecionado: </span>
                            {selectedDateTime.date.toLocaleDateString('pt-PT', { weekday: 'long', day: '2-digit', month: 'long' })}
                            {' · '}
                            {minutesToTime(selectedDateTime.startMin)} — {minutesToTime(selectedDateTime.startMin + selectedService.duration)}
                        </div>
                    )}

                    <div className="flex gap-2">
                        <button
                            onClick={() => setStep(1)}
                            className="h-11 px-4 border border-border rounded-xl text-sm hover:bg-muted transition flex items-center gap-2"
                        >
                            <ChevronLeft size={15} /> Voltar
                        </button>
                        <button
                            onClick={() => setStep(3)}
                            disabled={!selectedDateTime}
                            className="flex-1 h-11 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:opacity-90 transition disabled:opacity-40 flex items-center justify-center gap-2"
                        >
                            Continuar <ChevronRight size={15} />
                        </button>
                    </div>
                </div>
            )}

            {step === 3 && (
                <div className="space-y-4">
                    <h2 className="text-sm font-semibold">Os teus dados</h2>

                    <div className="bg-muted/50 border border-border rounded-xl p-4 space-y-1">
                        <p className="text-sm font-medium">{selectedService?.name}</p>
                        <p className="text-xs text-muted-foreground">
                            {selectedDateTime?.date.toLocaleDateString('pt-PT', { weekday: 'long', day: '2-digit', month: 'long' })}
                            {selectedDateTime && selectedService && ` · ${minutesToTime(selectedDateTime.startMin)} — ${minutesToTime(selectedDateTime.startMin + selectedService.duration)}`}
                        </p>
                        <p className="text-xs text-muted-foreground">
                            {selectedService?.price.toFixed(2)}€ · {selectedService?.duration} min
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-3">
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium">Nome</label>
                            <input
                                type="text"
                                placeholder="O teu nome"
                                required
                                value={form.name}
                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                                className="w-full h-10 px-3 rounded-lg border border-input bg-background text-sm outline-none focus:ring-2 focus:ring-ring transition"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium">Telemóvel</label>
                            <input
                                type="tel"
                                placeholder="+351 9xx xxx xxx"
                                required
                                value={form.phone}
                                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                                className="w-full h-10 px-3 rounded-lg border border-input bg-background text-sm outline-none focus:ring-2 focus:ring-ring transition"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium">
                                Email <span className="text-muted-foreground font-normal">(opcional)</span>
                            </label>
                            <input
                                type="email"
                                placeholder="para receberes a confirmação"
                                value={form.email}
                                onChange={(e) => setForm({ ...form, email: e.target.value })}
                                className="w-full h-10 px-3 rounded-lg border border-input bg-background text-sm outline-none focus:ring-2 focus:ring-ring transition"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium">
                                Notas <span className="text-muted-foreground font-normal">(opcional)</span>
                            </label>
                            <textarea
                                placeholder="Ex: carro SUV, algum detalhe especial..."
                                value={form.notes}
                                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                                rows={3}
                                className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm outline-none focus:ring-2 focus:ring-ring transition resize-none"
                            />
                        </div>

                        {error && (
                            <div className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-lg">
                                {error}
                            </div>
                        )}

                        <div className="flex gap-2 pt-1">
                            <button
                                type="button"
                                onClick={() => setStep(2)}
                                className="h-11 px-4 border border-border rounded-xl text-sm hover:bg-muted transition flex items-center gap-2"
                            >
                                <ChevronLeft size={15} /> Voltar
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 h-11 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:opacity-90 transition disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {loading ? 'A confirmar...' : 'Confirmar marcação'}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    )
}