import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import SettingsClient from '@/components/dashboard/SettingsClient'

export default async function SettingsPage() {
    const session = await auth()
    if (!session?.user?.id) redirect('/login')

    const business = await prisma.business.findUnique({
        where: { ownerId: session.user.id },
        include: { schedules: { orderBy: { dayOfWeek: 'asc' } } },
    })

    if (!business) redirect('/onboarding')

    return <SettingsClient business={business} schedules={business.schedules} />
}