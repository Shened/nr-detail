'use client'

import { useState } from 'react'
import { CalendarDays, Clock, User, Search } from 'lucide-react'

type BookingStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED'

interface Booking {
    id: string
    date: Date
    startTime: string
    endTime: string
    status: BookingStatus
    notes: string | null
    customer: { name: string; phone: string; email: string | null }
    service: { name: string; price: number; duration: number }
}

interface Props {
    bookings: Booking[]
}

const statusConfig = {
    PENDING: { label: 'Pendente', className: 'bg-amber-100 text-amber-700' },
    CONFIRMED: { label: 'Confirmada', className: 'bg-green-100 text-green-700' },
    CANCELLED: { label: 'Cancelada', className: 'bg-red-100 text-red-700' },
    COMPLETED: { label: 'Concluída', className: 'bg-muted text-muted-foreground' },
}

export default function BookingsClient({ bookings: initial }: Props) {
    const [bookings, setBookings] = useState<Booking[]>(initial)
    const [search, setSearch] = useState('')
    const [filter, setFilter] = useState<BookingStatus | 'ALL'>('ALL')

    const filtered = bookings.filter((b) => {
        const matchesSearch =
            b.customer.name.toLowerCase().includes(search.toLowerCase()) ||
            b.service.name.toLowerCase().includes(search.toLowerCase())
        const matchesFilter = filter === 'ALL' || b.status === filter
        return matchesSearch && matchesFilter
    })

    async function updateStatus(id: string, status: BookingStatus) {
        const res = await fetch(`/api/bookings/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status }),
        })

        if (res.ok) {
            setBookings(bookings.map((b) => (b.id === id ? { ...b, status } : b)))
        }
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-semibold tracking-tight">Marcações</h1>
                <p className="text-sm text-muted-foreground mt-1">
                    Gere todas as marcações do teu negócio
                </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Pesquisar por cliente ou serviço..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full h-10 pl-9 pr-3 rounded-lg border border-input bg-background text-sm outline-none focus:ring-2 focus:ring-ring transition"
                    />
                </div>
                <div className="flex gap-2">
                    {(['ALL', 'PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'] as const).map((s) => (
                        <button
                            key={s}
                            onClick={() => setFilter(s)}
                            className={`h-10 px-3 rounded-lg text-xs font-medium transition ${filter === s
                                    ? 'bg-primary text-primary-foreground'
                                    : 'border border-border hover:bg-muted text-muted-foreground'
                                }`}
                        >
                            {s === 'ALL' ? 'Todas' : statusConfig[s].label}
                        </button>
                    ))}
                </div>
            </div>

            {filtered.length === 0 ? (
                <div className="bg-card border border-border rounded-xl p-10 text-center">
                    <p className="text-sm text-muted-foreground">Nenhuma marcação encontrada.</p>
                </div>
            ) : (
                <div className="bg-card border border-border rounded-xl divide-y divide-border">
                    {filtered.map((booking) => (
                        <div key={booking.id} className="px-5 py-4">
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                                        <span className="text-xs font-medium">
                                            {booking.customer.name.charAt(0).toUpperCase()}
                                        </span>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium">{booking.customer.name}</p>
                                        <p className="text-xs text-muted-foreground">{booking.customer.phone}</p>
                                    </div>
                                </div>
                                <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${statusConfig[booking.status].className}`}>
                                    {statusConfig[booking.status].label}
                                </span>
                            </div>

                            <div className="mt-3 flex flex-wrap gap-4">
                                <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                    <CalendarDays size={12} />
                                    {new Date(booking.date).toLocaleDateString('pt-PT', {
                                        weekday: 'short', day: '2-digit', month: 'short', year: 'numeric',
                                    })}
                                </span>
                                <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                    <Clock size={12} />
                                    {booking.startTime} — {booking.endTime}
                                </span>
                                <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                    <User size={12} />
                                    {booking.service.name} · {booking.service.price}€
                                </span>
                            </div>

                            {booking.notes && (
                                <p className="mt-2 text-xs text-muted-foreground bg-muted px-3 py-2 rounded-lg">
                                    {booking.notes}
                                </p>
                            )}

                            {booking.status === 'PENDING' && (
                                <div className="mt-3 flex gap-2">
                                    <button
                                        onClick={() => updateStatus(booking.id, 'CONFIRMED')}
                                        className="h-8 px-3 bg-primary text-primary-foreground rounded-lg text-xs font-medium hover:opacity-90 transition"
                                    >
                                        Confirmar
                                    </button>
                                    <button
                                        onClick={() => updateStatus(booking.id, 'CANCELLED')}
                                        className="h-8 px-3 border border-border rounded-lg text-xs text-muted-foreground hover:bg-muted transition"
                                    >
                                        Cancelar
                                    </button>
                                </div>
                            )}
                            {booking.status === 'CONFIRMED' && (
                                <div className="mt-3">
                                    <button
                                        onClick={() => updateStatus(booking.id, 'COMPLETED')}
                                        className="h-8 px-3 border border-border rounded-lg text-xs text-muted-foreground hover:bg-muted transition"
                                    >
                                        Marcar como concluída
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}