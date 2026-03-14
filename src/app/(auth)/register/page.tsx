'use client'

import { useState } from 'react'
import Link from 'next/link'
import { registerAction } from '../actions'

export default function RegisterPage() {
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setLoading(true)
        setError(null)

        const formData = new FormData(e.currentTarget)
        const data = {
            name: formData.get('name') as string,
            email: formData.get('email') as string,
            password: formData.get('password') as string,
        }

        const result = await registerAction(data)

        if (result?.error) {
            setError(result.error)
            setLoading(false)
        }
    }

    return (
        <div className="w-full">
            <div className="mb-8 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-primary mb-4">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="9" /><path d="M5 12h14M12 5l4 7-4 7-4-7z" />
                    </svg>
                </div>
                <h1 className="text-2xl font-semibold tracking-tight">Cria a tua conta</h1>
                <p className="text-sm text-muted-foreground mt-1">Começa a receber marcações hoje</p>
            </div>

            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-1.5">
                        <label htmlFor="name" className="text-sm font-medium">Nome</label>
                        <input
                            id="name"
                            name="name"
                            type="text"
                            placeholder="O teu nome"
                            required
                            className="w-full h-10 px-3 rounded-lg border border-input bg-background text-sm outline-none focus:ring-2 focus:ring-ring transition"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label htmlFor="email" className="text-sm font-medium">Email</label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            placeholder="email@exemplo.com"
                            required
                            className="w-full h-10 px-3 rounded-lg border border-input bg-background text-sm outline-none focus:ring-2 focus:ring-ring transition"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label htmlFor="password" className="text-sm font-medium">Password</label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            placeholder="Mínimo 6 caracteres"
                            required
                            className="w-full h-10 px-3 rounded-lg border border-input bg-background text-sm outline-none focus:ring-2 focus:ring-ring transition"
                        />
                    </div>

                    {error && (
                        <div className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-lg">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full h-10 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition disabled:opacity-50 mt-2"
                    >
                        {loading ? 'A criar conta...' : 'Criar conta'}
                    </button>
                </form>
            </div>

            <p className="text-center text-sm text-muted-foreground mt-6">
                Já tens conta?{' '}
                <Link href="/login" className="text-foreground font-medium hover:underline underline-offset-4">
                    Entrar
                </Link>
            </p>
        </div>
    )
}