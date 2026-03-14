import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url)
    const businessId = searchParams.get('businessId')
    const date = searchParams.get('date')

    if (!businessId || !date) {
        return NextResponse.json({ error: 'Parâmetros em falta' }, { status: 400 })
    }

    const bookings = await prisma.booking.findMany({
        where: {
            businessId,
            date: new Date(date),
            status: { in: ['PENDING', 'CONFIRMED'] },
        },
        select: { startTime: true },
    })

    const takenSlots = bookings.map((b) => b.startTime)

    return NextResponse.json({ takenSlots })
}