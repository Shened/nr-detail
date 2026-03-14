'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function OnboardingPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setLoading(true)
        setError(null)

        const formData = new FormData(e.currentTarget)

        const res = await fetch('/api/business', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: formData.get('name') as string,
                slug: formData.get('slug') as string,
                phone: formData.get('phone') as string,
            }),
        })

        const data = await res.json()

        if (!res.ok) {
            setError(data.error ?? 'Erro ao criar negócio')
            setLoading(false)
            return
        }

        router.push('/dashboard')
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-8">
            <div className="w-full max-w-md">
                <div className="mb-8">
                    <h1 className="text-2xl font-semibold tracking-tight">Configura o teu negócio</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Só demora 1 minuto. Podes alterar tudo depois.
                    </p>
                </div>

                <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-1.5">
                            <label htmlFor="name" className="text-sm font-medium">Nome do negócio</label>
                            <input
                                id="name"
                                name="name"
                                type="text"
                                placeholder="Ex: AutoShine Porto"
                                required
                                className="w-full h-10 px-3 rounded-lg border border-input bg-background text-sm outline-none focus:ring-2 focus:ring-ring transition"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label htmlFor="slug" className="text-sm font-medium">
                                Link público
                            </label>
                            <div className="flex items-center h-10 rounded-lg border border-input bg-background overflow-hidden focus-within:ring-2 focus-within:ring-ring transition">
                                <span className="px-3 text-sm text-muted-foreground border-r border-input h-full flex items-center bg-muted">
                                    autobooking.pt/
                                </span>
                                <input
                                    id="slug"
                                    name="slug"
                                    type="text"
                                    placeholder="autoshine-porto"
                                    required
                                    className="flex-1 px-3 text-sm outline-none bg-transparent"
                                />
                            </div>
                            <p className="text-xs text-muted-foreground">
                                É o link que partilhas com os teus clientes
                            </p>
                        </div>
                        <div className="space-y-1.5">
                            <label htmlFor="phone" className="text-sm font-medium">Telemóvel</label>
                            <input
                                id="phone"
                                name="phone"
                                type="tel"
                                placeholder="+351 9xx xxx xxx"
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
                            className="w-full h-10 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition disabled:opacity-50"
                        >
                            {loading ? 'A criar...' : 'Criar negócio'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
}