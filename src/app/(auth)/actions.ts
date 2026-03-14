'use server'

import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { signIn } from '@/lib/auth'

const registerSchema = z.object({
    name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
    email: z.string().email('Email inválido'),
    password: z.string().min(6, 'Password deve ter pelo menos 6 caracteres'),
})

export async function registerAction(formData: unknown) {
    const parsed = registerSchema.safeParse(formData)

    if (!parsed.success) {
        const firstError = parsed.error.issues[0]?.message ?? 'Erro de validação'
        return { error: firstError }
    }

    const { name, email, password } = parsed.data

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
        return { error: 'Este email já está registado' }
    }

    const hashedPassword = await bcrypt.hash(password, 12)

    await prisma.user.create({
        data: { name, email, password: hashedPassword },
    })

    await signIn('credentials', {
        email,
        password,
        redirectTo: '/dashboard',
    })
}