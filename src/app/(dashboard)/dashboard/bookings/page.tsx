import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import BookingsClient from '@/components/dashboard/BookingsClient'

export default async function BookingsPage() {
    const session = await auth()
    if (!session?.user?.id) redirect('/login')

    const business = await prisma.business.findUnique({
        where: { ownerId: session.user.id },
    })

    if (!business) redirect('/onboarding')

    const bookings = await prisma.booking.findMany({
        where: { businessId: business.id },
        include: { service: true, customer: true },
        orderBy: { date: 'desc' },
    })

    return <BookingsClient bookings={bookings} />
}