'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight, X, Plus } from 'lucide-react'

interface Schedule {
    dayOfWeek: number
    startTime: string
    endTime: string
    isOpen: boolean
}

interface BlockedSlot {
    id: string
    date: Date
    startTime: string
    endTime: string
    reason: string | null
}

interface Business {
    id: string
    name: string
}

interface Props {
    business: Business
    schedules: Schedule[]
    blockedSlots: BlockedSlot[]
}

const MONTHS = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
]
const DAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

function generateSlots(startTime: string, endTime: string): string[] {
    const slots: string[] = []
    const [sh, sm] = startTime.split(':').map(Number)
    const [eh, em] = endTime.split(':').map(Number)
    let current = sh * 60 + sm
    const end = eh * 60 + em
    while (current < end) {
        const h = String(Math.floor(current / 60)).padStart(2, '0')
        const m = String(current % 60).padStart(2, '0')
        slots.push(`${h}:${m}`)
        current += 30
    }
    return slots
}

export default function AvailabilityClient({ business, schedules, blockedSlots: initial }: Props) {
    const [blocked, setBlocked] = useState<BlockedSlot[]>(initial)
    const [selectedDate, setSelectedDate] = useState<Date | null>(null)
    const [selectedSlots, setSelectedSlots] = useState<string[]>([])
    const [reason, setReason] = useState('')
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)

    const today = new Date()
    const [calYear, setCalYear] = useState(today.getFullYear())
    const [calMonth, setCalMonth] = useState(today.getMonth())

    const firstDay = new Date(calYear, calMonth, 1).getDay()
    const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate()

    function getScheduleForDay(date: Date): Schedule | null {
        return schedules.find((s) => s.dayOfWeek === date.getDay() && s.isOpen) ?? null
    }

    function getBlockedSlotsForDate(date: Date): BlockedSlot[] {
        return blocked.filter(
            (b) => new Date(b.date).toDateString() === date.toDateString()
        )
    }

    function toggleSlot(slot: string) {
        setSelectedSlots((prev) =>
            prev.includes(slot) ? prev.filter((s) => s !== slot) : [...prev, slot]
        )
    }

    async function handleBlock() {
        if (!selectedDate || selectedSlots.length === 0) return
        setLoading(true)
        setSuccess(false)

        const newBlocked: BlockedSlot[] = []

        for (const slot of selectedSlots) {
            const [h, m] = slot.split(':').map(Number)
            const endMinutes = h * 60 + m + 30
            const endTime = `${String(Math.floor(endMinutes / 60)).padStart(2, '0')}:${String(endMinutes % 60).padStart(2, '0')}`

            const res = await fetch('/api/blocked-slots', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    date: selectedDate.toISOString(),
                    startTime: slot,
                    endTime,
                    reason: reason || null,
                }),
            })

            const data = await res.json()
            if (res.ok) newBlocked.push(data)
        }

        setBlocked([...blocked, ...newBlocked])
        setSelectedSlots([])
        setReason('')
        setSuccess(true)
        setTimeout(() => setSuccess(false), 3000)
        setLoading(false)
    }

    async function handleUnblock(id: string) {
        await fetch(`/api/blocked-slots/${id}`, { method: 'DELETE' })
        setBlocked(blocked.filter((b) => b.id !== id))
    }

    const selectedSchedule = selectedDate ? getScheduleForDay(selectedDate) : null
    const availableSlots = selectedSchedule
        ? generateSlots(selectedSchedule.startTime, selectedSchedule.endTime)
        : []
    const blockedForSelected = selectedDate ? getBlockedSlotsForDate(selectedDate) : []
    const blockedTimesForSelected = blockedForSelected.map((b) => b.startTime)

    return (
        <div className="space-y-6 max-w-3xl">
            <div>
                <h1 className="text-2xl font-semibold tracking-tight">Disponibilidade</h1>
                <p className="text-sm text-muted-foreground mt-1">
                    Bloqueia horários em dias específicos quando não estiveres disponível
                </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-card border border-border rounded-xl p-4">
                    <div className="flex items-center justify-between mb-4">
                        <button
                            onClick={() => {
                                if (calMonth === 0) { setCalMonth(11); setCalYear(calYear - 1) }
                                else setCalMonth(calMonth - 1)
                            }}
                            className="w-8 h-8 rounded-lg border border-border flex items-center justify-center hover:bg-muted transition"
                        >
                            <ChevronLeft size={15} />
                        </button>
                        <span className="text-sm font-medium">{MONTHS[calMonth]} {calYear}</span>
                        <button
                            onClick={() => {
                                if (calMonth === 11) { setCalMonth(0); setCalYear(calYear + 1) }
                                else setCalMonth(calMonth + 1)
                            }}
                            className="w-8 h-8 rounded-lg border border-border flex items-center justify-center hover:bg-muted transition"
                        >
                            <ChevronRight size={15} />
                        </button>
                    </div>
                    <div className="grid grid-cols-7 gap-1 mb-2">
                        {DAYS.map((d) => (
                            <div key={d} className="text-center text-xs text-muted-foreground py-1">{d}</div>
                        ))}
                    </div>
                    <div className="grid grid-cols-7 gap-1">
                        {Array.from({ length: firstDay }).map((_, i) => <div key={i} />)}
                        {Array.from({ length: daysInMonth }).map((_, i) => {
                            const day = i + 1
                            const date = new Date(calYear, calMonth, day)
                            const isPast = date < new Date(today.getFullYear(), today.getMonth(), today.getDate())
                            const isSelected = selectedDate?.toDateString() === date.toDateString()
                            const hasBlocked = getBlockedSlotsForDate(date).length > 0
                            const schedule = getScheduleForDay(date)
                            const isOff = !schedule

                            return (
                                <button
                                    key={day}
                                    disabled={isPast}
                                    onClick={() => {
                                        setSelectedDate(date)
                                        setSelectedSlots([])
                                    }}
                                    className={`h-9 rounded-lg text-xs transition relative ${isSelected ? 'bg-primary text-primary-foreground font-medium' :
                                            isPast ? 'text-muted-foreground/30 cursor-not-allowed' :
                                                isOff ? 'text-muted-foreground/50' :
                                                    'hover:bg-muted text-foreground'
                                        }`}
                                >
                                    {day}
                                    {hasBlocked && !isSelected && (
                                        <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-amber-400" />
                                    )}
                                </button>
                            )
                        })}
                    </div>
                </div>

                <div className="space-y-4">
                    {!selectedDate ? (
                        <div className="bg-card border border-border rounded-xl p-6 text-center h-full flex items-center justify-center">
                            <p className="text-sm text-muted-foreground">Seleciona um dia no calendário</p>
                        </div>
                    ) : (
                        <>
                            <div className="bg-card border border-border rounded-xl p-4">
                                <p className="text-sm font-medium mb-3">
                                    {selectedDate.toLocaleDateString('pt-PT', { weekday: 'long', day: '2-digit', month: 'long' })}
                                </p>

                                {!selectedSchedule ? (
                                    <p className="text-sm text-muted-foreground">Dia de folga — negócio fechado</p>
                                ) : (
                                    <>
                                        <p className="text-xs text-muted-foreground mb-3">
                                            Seleciona os horários a bloquear
                                        </p>
                                        <div className="grid grid-cols-3 gap-1.5">
                                            {availableSlots.map((slot) => {
                                                const isBlocked = blockedTimesForSelected.includes(slot)
                                                const isSelected = selectedSlots.includes(slot)
                                                return (
                                                    <button
                                                        key={slot}
                                                        disabled={isBlocked}
                                                        onClick={() => toggleSlot(slot)}
                                                        className={`h-9 rounded-lg text-xs transition border ${isBlocked ? 'border-red-200 bg-red-50 text-red-400 cursor-not-allowed line-through' :
                                                                isSelected ? 'border-primary bg-primary text-primary-foreground font-medium' :
                                                                    'border-border hover:border-primary/50 hover:bg-muted'
                                                            }`}
                                                    >
                                                        {slot}
                                                    </button>
                                                )
                                            })}
                                        </div>

                                        {selectedSlots.length > 0 && (
                                            <div className="mt-3 space-y-2">
                                                <input
                                                    type="text"
                                                    value={reason}
                                                    onChange={(e) => setReason(e.target.value)}
                                                    placeholder="Motivo (opcional)"
                                                    className="w-full h-9 px-3 rounded-lg border border-input bg-background text-xs outline-none focus:ring-2 focus:ring-ring transition"
                                                />
                                                {success && (
                                                    <p className="text-xs text-green-700 bg-green-50 px-3 py-1.5 rounded-lg">
                                                        Horários bloqueados com sucesso!
                                                    </p>
                                                )}
                                                <button
                                                    onClick={handleBlock}
                                                    disabled={loading}
                                                    className="w-full h-9 bg-primary text-primary-foreground rounded-lg text-xs font-medium hover:opacity-90 transition disabled:opacity-50 flex items-center justify-center gap-2"
                                                >
                                                    <Plus size={13} />
                                                    {loading ? 'A bloquear...' : `Bloquear ${selectedSlots.length} horário${selectedSlots.length > 1 ? 's' : ''}`}
                                                </button>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>

                            {blockedForSelected.length > 0 && (
                                <div className="bg-card border border-border rounded-xl p-4">
                                    <p className="text-xs font-medium text-muted-foreground mb-2">Horários bloqueados</p>
                                    <div className="space-y-1.5">
                                        {blockedForSelected.map((b) => (
                                            <div key={b.id} className="flex items-center justify-between py-1.5 px-2 bg-red-50 border border-red-100 rounded-lg">
                                                <div>
                                                    <span className="text-xs font-medium text-red-700">{b.startTime}</span>
                                                    {b.reason && <span className="text-xs text-red-400 ml-2">— {b.reason}</span>}
                                                </div>
                                                <button
                                                    onClick={() => handleUnblock(b.id)}
                                                    className="w-5 h-5 rounded flex items-center justify-center hover:bg-red-100 transition"
                                                >
                                                    <X size={12} className="text-red-500" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}