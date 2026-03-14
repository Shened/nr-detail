import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import BookingForm from '@/components/booking/BookingForms'

export default async function PublicBookingPage({
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
                <div className="mb-10 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center mx-auto mb-4">
                        <span className="text-primary-foreground text-2xl font-bold">
                            {business.name.charAt(0)}
                        </span>
                    </div>
                    <h1 className="text-2xl font-semibold">{business.name}</h1>
                    {business.description && (
                        <p className="text-muted-foreground mt-2 text-sm">{business.description}</p>
                    )}
                </div>

                <BookingForm business={business} services={business.services} />
            </div>
        </div>
    )
}