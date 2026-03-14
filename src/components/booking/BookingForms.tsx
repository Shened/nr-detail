'use client'

import { useState } from 'react'
import { ChevronRight, ChevronLeft, Clock, Euro, Check } from 'lucide-react'

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

const SLOTS = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', 
    '14:00','14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30'
]

const MONTHS = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
]

const DAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

export default function BookingForm({ business, services }: Props) {
    const [step, setStep] = useState(1)
    const [selectedService, setSelectedService] = useState<Service | null>(null)
    const [selectedDate, setSelectedDate] = useState<Date | null>(null)
    const [selectedSlot, setSelectedSlot] = useState<string | null>(null)
    const [takenSlots, setTakenSlots] = useState<string[]>([])
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const today = new Date()
    const [calYear, setCalYear] = useState(today.getFullYear())
    const [calMonth, setCalMonth] = useState(today.getMonth())

    const [form, setForm] = useState({ name: '', phone: '', email: '', notes: '' })

    async function loadTakenSlots(date: Date) {
        const res = await fetch(
            `/api/bookings/availability?businessId=${business.id}&date=${date.toISOString().split('T')[0]}`
        )
        const data = await res.json()
        setTakenSlots(data.takenSlots ?? [])
    }

    async function selectDate(date: Date) {
        setSelectedDate(date)
        setSelectedSlot(null)
        await loadTakenSlots(date)
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        if (!selectedService || !selectedDate || !selectedSlot) return
        setLoading(true)
        setError(null)

        const [h, m] = selectedSlot.split(':').map(Number)
        const endMinutes = h * 60 + m + selectedService.duration
        const endTime = `${String(Math.floor(endMinutes / 60)).padStart(2, '0')}:${String(endMinutes % 60).padStart(2, '0')}`

        const res = await fetch('/api/bookings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                businessId: business.id,
                serviceId: selectedService.id,
                date: selectedDate.toISOString(),
                startTime: selectedSlot,
                endTime,
                customerName: form.name,
                customerPhone: form.phone,
                customerEmail: form.email,
                notes: form.notes,
            }),
        })

        const data = await res.json()

        if (!res.ok) {
            setError(data.error ?? 'Erro ao criar marcação')
            setLoading(false)
            return
        }

        setSuccess(true)
        setLoading(false)
    }

    const firstDay = new Date(calYear, calMonth, 1).getDay()
    const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate()

    if (success) {
        return (
            <div className="bg-card border border-border rounded-2xl p-10 text-center">
                <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                    <Check size={24} className="text-green-600" />
                </div>
                <h2 className="text-xl font-semibold">Marcação confirmada!</h2>
                <p className="text-muted-foreground text-sm mt-2">
                    {form.name}, a tua marcação de <strong>{selectedService?.name}</strong> está marcada
                    para {selectedDate?.toLocaleDateString('pt-PT', { day: '2-digit', month: 'long' })} às {selectedSlot}.
                </p>
                <p className="text-xs text-muted-foreground mt-3">
                    Vais receber uma confirmação no email fornecido.
                </p>
                <div className="flex flex-col sm:flex-row gap-2 mt-6 justify-center">
                    <button
                        onClick={() => {
                            setStep(1)
                            setSelectedService(null)
                            setSelectedDate(null)
                            setSelectedSlot(null)
                            setForm({ name: '', phone: '', email: '', notes: '' })
                            setSuccess(false)
                        }}
                        className="h-10 px-6 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition" >
                        Nova marcação
                    </button>
                    <a href="/" className="h-10 px-6 border border-border rounded-lg text-sm font-medium hover:bg-muted transition flex items-center justify-center" >
                        Voltar ao início
                    </a>
                </div>
            </div >
        )
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2 mb-6">
                {[1, 2, 3].map((s) => (
                    <div key={s} className="flex items-center gap-2 flex-1">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0 transition-colors ${step > s ? 'bg-primary text-primary-foreground' :
                            step === s ? 'bg-primary text-primary-foreground' :
                                'bg-muted text-muted-foreground'
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
                            onClick={() => setSelectedService(service)}
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
                    <h2 className="text-sm font-semibold">Escolhe o dia e hora</h2>
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
                                const isWeekend = date.getDay() === 0
                                const isSelected = selectedDate?.toDateString() === date.toDateString()
                                return (
                                    <button
                                        key={day}
                                        disabled={isPast || isWeekend}
                                        onClick={() => selectDate(date)}
                                        className={`h-9 rounded-lg text-sm transition ${isSelected ? 'bg-primary text-primary-foreground font-medium' :
                                            isPast || isWeekend ? 'text-muted-foreground/40 cursor-not-allowed' :
                                                'hover:bg-muted text-foreground'
                                            }`}
                                    >
                                        {day}
                                    </button>
                                )
                            })}
                        </div>
                    </div>

                    {selectedDate && (
                        <div>
                            <p className="text-sm font-medium mb-3">Horários disponíveis</p>
                            <div className="grid grid-cols-3 gap-2">
                                {SLOTS.map((slot) => {
                                    const taken = takenSlots.includes(slot)
                                    return (
                                        <button
                                            key={slot}
                                            disabled={taken}
                                            onClick={() => setSelectedSlot(slot)}
                                            className={`h-10 rounded-lg text-sm transition border ${selectedSlot === slot ? 'bg-primary text-primary-foreground border-primary font-medium' :
                                                taken ? 'border-border text-muted-foreground/40 cursor-not-allowed line-through' :
                                                    'border-border hover:border-primary/50 hover:bg-muted'
                                                }`}
                                        >
                                            {slot}
                                        </button>
                                    )
                                })}
                            </div>
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
                            disabled={!selectedDate || !selectedSlot}
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
                            {selectedDate?.toLocaleDateString('pt-PT', { weekday: 'long', day: '2-digit', month: 'long' })} · {selectedSlot}
                        </p>
                        <p className="text-xs text-muted-foreground">{selectedService?.price.toFixed(2)}€ · {selectedService?.duration} min</p>
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
                            <label className="text-sm font-medium">Email <span className="text-muted-foreground font-normal">(opcional)</span></label>
                            <input
                                type="email"
                                placeholder="para receberes a confirmação"
                                value={form.email}
                                onChange={(e) => setForm({ ...form, email: e.target.value })}
                                className="w-full h-10 px-3 rounded-lg border border-input bg-background text-sm outline-none focus:ring-2 focus:ring-ring transition"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium">Notas <span className="text-muted-foreground font-normal">(opcional)</span></label>
                            <textarea
                                placeholder="Ex: carro SUV, precisas de algum detalhe especial..."
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