import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { CalendarDays, Users, Clock, TrendingUp } from 'lucide-react'

export default async function DashboardPage() {
    const session = await auth()
    if (!session?.user?.id) redirect('/login')

    const business = await prisma.business.findUnique({
        where: { ownerId: session.user.id },
        include: {
            bookings: {
                include: { service: true, customer: true },
                orderBy: { date: 'desc' },
            },
            services: true,
        },
    })

    if (!business) redirect('/onboarding')

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const todayBookings = business.bookings.filter(
        (b) => b.date >= today && b.date < tomorrow
    )

    const pendingBookings = business.bookings.filter(
        (b) => b.status === 'PENDING'
    )

    const totalRevenue = business.bookings
        .filter((b) => b.status === 'COMPLETED')
        .reduce((sum, b) => sum + b.service.price, 0)

    const recentBookings = business.bookings.slice(0, 5)

    const stats = [
        {
            label: 'Marcações hoje',
            value: todayBookings.length,
            icon: CalendarDays,
            sub: 'agendadas para hoje',
        },
        {
            label: 'Pendentes',
            value: pendingBookings.length,
            icon: Clock,
            sub: 'aguardam confirmação',
        },
        {
            label: 'Total clientes',
            value: new Set(business.bookings.map((b) => b.customerId)).size,
            icon: Users,
            sub: 'clientes únicos',
        },
        {
            label: 'Receita total',
            value: `${totalRevenue.toFixed(0)}€`,
            icon: TrendingUp,
            sub: 'em serviços concluídos',
        },
    ]

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-semibold tracking-tight">Visão geral</h1>
                <p className="text-sm text-muted-foreground mt-1">
                    Bem-vindo de volta, {session.user.name?.split(' ')[0]}
                </p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat) => {
                    const Icon = stat.icon
                    return (
                        <div
                            key={stat.label}
                            className="bg-card border border-border rounded-xl p-4 space-y-3"
                        >
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                    {stat.label}
                                </span>
                                <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                                    <Icon size={15} className="text-muted-foreground" />
                                </div>
                            </div>
                            <div>
                                <p className="text-2xl font-semibold">{stat.value}</p>
                                <p className="text-xs text-muted-foreground mt-0.5">{stat.sub}</p>
                            </div>
                        </div>
                    )
                })}
            </div>

            <div className="bg-card border border-border rounded-xl">
                <div className="px-5 py-4 border-b border-border flex items-center justify-between">
                    <h2 className="text-sm font-semibold">Marcações recentes</h2>
                    <a href="/dashboard/bookings" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                        Ver todas
                    </a>
                </div>
                {recentBookings.length === 0 ? (
                    <div className="p-8 text-center">
                        <p className="text-sm text-muted-foreground">Ainda não há marcações.</p>
                        <p className="text-xs text-muted-foreground mt-1">
                            Partilha o teu link com os clientes para começar.
                        </p>
                    </div>
                ) : (
                    <div className="divide-y divide-border">
                        {recentBookings.map((booking) => (
                            <div key={booking.id} className="px-5 py-3.5 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                                        <span className="text-xs font-medium">
                                            {booking.customer.name.charAt(0).toUpperCase()}
                                        </span>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium">{booking.customer.name}</p>
                                        <p className="text-xs text-muted-foreground">{booking.service.name}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm">
                                        {new Date(booking.date).toLocaleDateString('pt-PT', {
                                            day: '2-digit',
                                            month: 'short',
                                        })} · {booking.startTime}
                                    </p>
                                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${booking.status === 'CONFIRMED'
                                            ? 'bg-green-100 text-green-700'
                                            : booking.status === 'PENDING'
                                                ? 'bg-amber-100 text-amber-700'
                                                : booking.status === 'CANCELLED'
                                                    ? 'bg-red-100 text-red-700'
                                                    : 'bg-muted text-muted-foreground'
                                        }`}>
                                        {booking.status === 'CONFIRMED' ? 'Confirmada'
                                            : booking.status === 'PENDING' ? 'Pendente'
                                                : booking.status === 'CANCELLED' ? 'Cancelada'
                                                    : 'Concluída'}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}