import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import AvailabilityClient from '@/components/dashboard/AvailabilityClient'

export default async function AvailabilityPage() {
    const session = await auth()
    if (!session?.user?.id) redirect('/login')

    const business = await prisma.business.findUnique({
        where: { ownerId: session.user.id },
        include: {
            schedules: { orderBy: { dayOfWeek: 'asc' } },
            blockedSlots: {
                where: { date: { gte: new Date() } },
                orderBy: { date: 'asc' },
            },
        },
    })

    if (!business) redirect('/onboarding')

    return (
        <AvailabilityClient
            business={business}
            schedules={business.schedules}
            blockedSlots={business.blockedSlots}
        />
    )
}