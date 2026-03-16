import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const schema = z.object({
    name: z.string().min(2),
    slug: z.string().min(2).regex(/^[a-z0-9-]+$/, 'Apenas letras minúsculas, números e hífens'),
    phone: z.string().optional(),
    bookingView: z.enum(['SLOTS', 'TIMELINE']).default('SLOTS'),
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

    const { name, slug, phone } = parsed.data

    const existing = await prisma.business.findUnique({ where: { slug } })
    if (existing) {
        return NextResponse.json({ error: 'Este link já está ocupado' }, { status: 400 })
    }

    const business = await prisma.business.create({
        data: {
            name,
            slug,
            phone,
            ownerId: session.user.id,
        },
    })

    return NextResponse.json(business)
}

export async function PUT(req: Request) {
    const session = await auth()
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const body = await req.json()
    const parsed = z.object({
        name: z.string().min(2),
        slug: z.string().min(2).regex(/^[a-z0-9-]+$/),
        description: z.string().nullable().optional(),
        phone: z.string().nullable().optional(),
        email: z.string().nullable().optional(),
        address: z.string().nullable().optional(),
        logoUrl: z.string().nullable().optional(),
        coverUrl: z.string().nullable().optional(),
        bookingView: z.enum(['SLOTS', 'TIMELINE']).optional(),
    }).safeParse(body)

    if (!parsed.success) {
        return NextResponse.json(
            { error: parsed.error.issues[0]?.message ?? 'Dados inválidos' },
            { status: 400 }
        )
    }

    const business = await prisma.business.update({
        where: { ownerId: session.user.id },
        data: parsed.data,
    })

    return NextResponse.json(business)
}