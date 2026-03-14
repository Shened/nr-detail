import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import ServicesClient from '@/components/dashboard/ServicesClient'

export default async function ServicesPage() {
    const session = await auth()
    if (!session?.user?.id) redirect('/login')

    const business = await prisma.business.findUnique({
        where: { ownerId: session.user.id },
        include: { services: { orderBy: { createdAt: 'asc' } } },
    })

    if (!business) redirect('/onboarding')

    return <ServicesClient business={business} services={business.services} />
}