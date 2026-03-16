import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

function generateSlots(startTime: string, endTime: string, intervalMinutes: number): string[] {
    const slots: string[] = []
    const [sh, sm] = startTime.split(':').map(Number)
    const [eh, em] = endTime.split(':').map(Number)
    let current = sh * 60 + sm
    const end = eh * 60 + em
    while (current < end) {
        const h = String(Math.floor(current / 60)).padStart(2, '0')
        const m = String(current % 60).padStart(2, '0')
        slots.push(`${h}:${m}`)
        current += intervalMinutes
    }
    return slots
}

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url)
    const businessId = searchParams.get('businessId')
    const date = searchParams.get('date')
    const duration = Number(searchParams.get('duration') ?? 30)

    if (!businessId || !date) {
        return NextResponse.json({ error: 'Parâmetros em falta' }, { status: 400 })
    }

    const [year, month, day] = date.split('-').map(Number)
    const dateObj = new Date(year, month - 1, day)
    const dayOfWeek = dateObj.getDay()

    const schedule = await prisma.schedule.findFirst({
        where: { businessId, dayOfWeek },
    })

    if (!schedule || !schedule.isOpen) {
        return NextResponse.json({ slots: [], takenSlots: [] })
    }

    const allSlots = generateSlots(schedule.startTime, schedule.endTime, duration)

    const startOfDay = new Date(year, month - 1, day, 0, 0, 0)
    const endOfDay = new Date(year, month - 1, day, 23, 59, 59)

    const bookings = await prisma.booking.findMany({
        where: {
            businessId,
            date: { gte: startOfDay, lte: endOfDay },
            status: { in: ['PENDING', 'CONFIRMED'] },
        },
        select: { startTime: true },
    })

    const blockedSlots = await prisma.blockedSlot.findMany({
        where: {
            businessId,
            date: { gte: startOfDay, lte: endOfDay },
        },
        select: { startTime: true },
    })

    const takenSlots = [
        ...bookings.map((b) => b.startTime),
        ...blockedSlots.map((b) => b.startTime),
    ]

    return NextResponse.json({ slots: allSlots, takenSlots })
}