import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Sidebar from '@/components/dashboard/Sidebar'

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const session = await auth()

    if (!session?.user?.id) {
        redirect('/login')
    }

    const business = await prisma.business.findUnique({
        where: { ownerId: session.user.id },
    })

    if (!business) {
        redirect('/onboarding')
    }

    return (
        <div className="min-h-screen flex bg-background">
            <Sidebar business={business} user={session.user} />
            <main className="flex-1 flex flex-col min-w-0">
                <div className="flex-1 p-8">
                    {children}
                </div>
            </main>
        </div>
    )
}