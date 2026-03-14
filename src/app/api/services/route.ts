import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const schema = z.object({
    name: z.string().min(2),
    description: z.string().optional(),
    duration: z.number().min(15),
    price: z.number().min(0),
    businessId: z.string(),
})

export async function POST(req: Request) {
    const session = await auth()
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const body = await req.json()
    const parsed = schema.safeParse(body)

    if (!parsed.success) {
        return NextResponse.json(
            { error: parsed.error.issues[0]?.message ?? 'Dados inválidos' },
            { status: 400 }
        )
    }

    const service = await prisma.service.create({
        data: parsed.data,
    })

    return NextResponse.json(service)
}