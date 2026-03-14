import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { MapPin, Phone, Mail, Clock, ArrowRight, ArrowLeft, Star } from 'lucide-react'

const DAY_NAMES = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']

export default async function BusinessPage({
    params,
}: {
    params: Promise<{ slug: string }>
}) {
    const { slug } = await params

    const business = await prisma.business.findUnique({
        where: { slug },
        include: {
            services: { where: { active: true }, orderBy: { createdAt: 'asc' } },
            schedules: { orderBy: { dayOfWeek: 'asc' } },
        },
    })

    if (!business) notFound()

    const today = new Date().getDay()

    return (
        <div className="min-h-screen bg-background">
            <header className="border-b border-border bg-background">
                <div className="max-w-3xl mx-auto px-6 h-14 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2 font-semibold">
                        <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="9" /><path d="M5 12h14M12 5l4 7-4 7-4-7z" />
                            </svg>
                        </div>
                        AutoBooking
                    </Link>
                    <Link
                        href="/"
                        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition"
                    >
                        <ArrowLeft size={14} />
                        Voltar
                    </Link>
                </div>
            </header>
            <div className="h-48 bg-gradient-to-br from-zinc-900 to-zinc-700 relative">
                <div className="absolute inset-0 flex items-end">
                    <div className="max-w-3xl mx-auto w-full px-6 pb-0">
                        <div className="w-20 h-20 rounded-2xl bg-primary border-4 border-background flex items-center justify-center translate-y-10 shadow-lg">
                            <span className="text-primary-foreground text-3xl font-bold">
                                {business.name.charAt(0)}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-3xl mx-auto px-6">
                <div className="pt-14 pb-6 border-b border-border">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-bold">{business.name}</h1>
                            {business.description && (
                                <p className="text-muted-foreground mt-1 text-sm leading-relaxed max-w-lg">
                                    {business.description}
                                </p>
                            )}
                            <div className="flex flex-wrap gap-4 mt-3">
                                {business.phone && (
                                    <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                        <Phone size={12} /> {business.phone}
                                    </span>
                                )}
                                {business.email && (
                                    <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                        <Mail size={12} /> {business.email}
                                    </span>
                                )}
                                {business.address && (
                                    <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                        <MapPin size={12} /> {business.address}
                                    </span>
                                )}
                            </div>
                        </div>
                        <Link
                            href={`/${slug}/booking`}
                            className="flex-shrink-0 h-10 px-5 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:opacity-90 transition flex items-center gap-2"
                        >
                            Marcar <ArrowRight size={14} />
                        </Link>
                    </div>
                </div>

                <div className="py-8 grid md:grid-cols-3 gap-8">
                    <div className="md:col-span-2 space-y-8">
                        <div>
                            <h2 className="text-base font-semibold mb-4">Serviços</h2>
                            <div className="space-y-3">
                                {business.services.length === 0 ? (
                                    <p className="text-sm text-muted-foreground">Nenhum serviço disponível.</p>
                                ) : (
                                    business.services.map((service) => (
                                        <div
                                            key={service.id}
                                            className="flex items-center justify-between p-4 bg-card border border-border rounded-xl"
                                        >
                                            <div>
                                                <p className="text-sm font-medium">{service.name}</p>
                                                {service.description && (
                                                    <p className="text-xs text-muted-foreground mt-0.5">{service.description}</p>
                                                )}
                                                <p className="text-xs text-muted-foreground mt-1">{service.duration} min</p>
                                            </div>
                                            <div className="text-right flex-shrink-0 ml-4">
                                                <p className="text-sm font-semibold">{service.price.toFixed(2)}€</p>
                                                <Link
                                                    href={`/${slug}/booking`}
                                                    className="text-xs text-primary hover:underline underline-offset-4 mt-1 inline-block"
                                                >
                                                    Marcar
                                                </Link>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        {business.schedules.length > 0 && (
                            <div>
                                <h2 className="text-base font-semibold mb-4 flex items-center gap-2">
                                    <Clock size={15} /> Horários
                                </h2>
                                <div className="space-y-2">
                                    {business.schedules.map((sched) => (
                                        <div
                                            key={sched.id}
                                            className={`flex items-center justify-between text-xs ${sched.dayOfWeek === today ? 'font-semibold text-foreground' : 'text-muted-foreground'
                                                }`}
                                        >
                                            <span>{DAY_NAMES[sched.dayOfWeek]}</span>
                                            <span>
                                                {sched.isOpen ? `${sched.startTime} — ${sched.endTime}` : 'Fechado'}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="bg-primary rounded-2xl p-5 text-primary-foreground">
                            <div className="flex gap-0.5 mb-2">
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <Star key={i} size={12} className="fill-primary-foreground text-primary-foreground" />
                                ))}
                            </div>
                            <p className="text-sm font-medium mb-3">Pronto para marcar?</p>
                            <Link
                                href={`/${slug}/booking`}
                                className="w-full h-9 bg-primary-foreground text-primary rounded-lg text-sm font-medium hover:opacity-90 transition flex items-center justify-center gap-2"
                            >
                                Agendar agora <ArrowRight size={13} />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            <footer className="border-t border-border py-6 mt-8">
                <div className="max-w-3xl mx-auto px-6 text-center">
                    <p className="text-xs text-muted-foreground">
                        Powered by{' '}
                        <Link href="/" className="font-medium hover:underline underline-offset-4">
                            AutoBooking
                        </Link>
                    </p>
                </div>
            </footer>
        </div>
    )
}