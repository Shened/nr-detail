import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const schema = z.object({
    date: z.string(),
    startTime: z.string(),
    endTime: z.string(),
    reason: z.string().optional(),
})

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url)
    const businessId = searchParams.get('businessId')
    const date = searchParams.get('date')

    if (!businessId) {
        return NextResponse.json({ error: 'businessId em falta' }, { status: 400 })
    }

    const where = {
        businessId,
        ...(date ? { date: new Date(date) } : {}),
    }

    const blocked = await prisma.blockedSlot.findMany({
        where,
        orderBy: { date: 'asc' },
    })

    return NextResponse.json(blocked)
}

export async function POST(req: Request) {
    const session = await auth()
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const business = await prisma.business.findUnique({
        where: { ownerId: session.user.id },
    })

    if (!business) {
        return NextResponse.json({ error: 'Negócio não encontrado' }, { status: 404 })
    }

    const body = await req.json()
    const parsed = schema.safeParse(body)

    if (!parsed.success) {
        return NextResponse.json(
            { error: parsed.error.issues[0]?.message ?? 'Dados inválidos' },
            { status: 400 }
        )
    }

    const blocked = await prisma.blockedSlot.create({
        data: {
            ...parsed.data,
            date: new Date(parsed.data.date),
            businessId: business.id,
        },
    })

    return NextResponse.json(blocked)
}