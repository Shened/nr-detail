import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const schema = z.object({
    businessId: z.string(),
    schedules: z.array(z.object({
        dayOfWeek: z.number(),
        startTime: z.string(),
        endTime: z.string(),
        isOpen: z.boolean(),
    })),
})

export async function POST(req: Request) {
    const session = await auth()
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const body = await req.json()
    const parsed = schema.safeParse(body)

    if (!parsed.success) {
        return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 })
    }

    const { businessId, schedules } = parsed.data

    await prisma.schedule.deleteMany({ where: { businessId } })

    await prisma.schedule.createMany({
        data: schedules.map((s) => ({ ...s, businessId })),
    })

    return NextResponse.json({ success: true })
}