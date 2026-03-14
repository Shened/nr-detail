import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const schema = z.object({
    businessId: z.string(),
    serviceId: z.string(),
    date: z.string(),
    startTime: z.string(),
    endTime: z.string(),
    customerName: z.string().min(2),
    customerPhone: z.string().min(9),
    customerEmail: z.string().email().optional().or(z.literal('')),
    notes: z.string().optional(),
})

export async function POST(req: Request) {
    const body = await req.json()
    const parsed = schema.safeParse(body)

    if (!parsed.success) {
        return NextResponse.json(
            { error: parsed.error.issues[0]?.message ?? 'Dados inválidos' },
            { status: 400 }
        )
    }

    const {
        businessId, serviceId, date, startTime, endTime,
        customerName, customerPhone, customerEmail, notes,
    } = parsed.data

    const existing = await prisma.booking.findFirst({
        where: {
            businessId,
            date: new Date(date),
            startTime,
            status: { in: ['PENDING', 'CONFIRMED'] },
        },
    })

    if (existing) {
        return NextResponse.json(
            { error: 'Este horário já está ocupado' },
            { status: 409 }
        )
    }

    let customer = await prisma.customer.findFirst({
        where: { phone: customerPhone },
    })

    if (!customer) {
        customer = await prisma.customer.create({
            data: {
                name: customerName,
                phone: customerPhone,
                email: customerEmail || null,
            },
        })
    }

    const booking = await prisma.booking.create({
        data: {
            businessId,
            serviceId,
            customerId: customer.id,
            date: new Date(date),
            startTime,
            endTime,
            notes: notes || null,
        },
    })

    return NextResponse.json(booking)
}