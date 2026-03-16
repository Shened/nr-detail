import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import BookingForm from '@/components/booking/BookingForms'
import TimelineBookingForm from '@/components/booking/TimelineBookingForm'
import { ArrowLeft } from 'lucide-react'

export default async function BookingPage({
    params,
}: {
    params: Promise<{ slug: string }>
}) {
    const { slug } = await params

    const business = await prisma.business.findUnique({
        where: { slug },
        include: {
            services: { where: { active: true }, orderBy: { createdAt: 'asc' } },
        },
    })

    if (!business) notFound()

    return (
        <div className="min-h-screen bg-background">
            <div className="max-w-2xl mx-auto px-4 py-12">
                <Link
                    href={`/${slug}`}
                    className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition mb-8"
                >
                    <ArrowLeft size={15} />
                    Voltar a {business.name}
                </Link>

                <div className="mb-8">
                    <h1 className="text-2xl font-semibold">Agendar marcação</h1>
                    <p className="text-sm text-muted-foreground mt-1">{business.name}</p>
                </div>

                {business.bookingView === 'TIMELINE' ? (
                    <TimelineBookingForm business={business} services={business.services} />
                ) : (
                    <BookingForm business={business} services={business.services} />
                )}
            </div>
        </div>
    )
}