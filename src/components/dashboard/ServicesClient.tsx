'use client'

import { useState } from 'react'
import { Plus, Pencil, Trash2, Clock, Euro } from 'lucide-react'

interface Service {
    id: string
    name: string
    description: string | null
    duration: number
    price: number
    active: boolean
}

interface Props {
    business: { id: string; name: string }
    services: Service[]
}

export default function ServicesClient({ business, services: initial }: Props) {
    const [services, setServices] = useState<Service[]>(initial)
    const [showForm, setShowForm] = useState(false)
    const [editing, setEditing] = useState<Service | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setLoading(true)
        setError(null)

        const formData = new FormData(e.currentTarget)
        const data = {
            name: formData.get('name') as string,
            description: formData.get('description') as string,
            duration: Number(formData.get('duration')),
            price: Number(formData.get('price')),
        }

        const url = editing ? `/api/services/${editing.id}` : '/api/services'
        const method = editing ? 'PUT' : 'POST'

        const res = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...data, businessId: business.id }),
        })

        const result = await res.json()

        if (!res.ok) {
            setError(result.error ?? 'Erro ao guardar serviço')
            setLoading(false)
            return
        }

        if (editing) {
            setServices(services.map((s) => (s.id === editing.id ? result : s)))
        } else {
            setServices([...services, result])
        }

        setShowForm(false)
        setEditing(null)
        setLoading(false)
    }

    async function handleDelete(id: string) {
        if (!confirm('Tens a certeza que queres eliminar este serviço?')) return

        const res = await fetch(`/api/services/${id}`, { method: 'DELETE' })
        if (res.ok) {
            setServices(services.filter((s) => s.id !== id))
        }
    }

    function handleEdit(service: Service) {
        setEditing(service)
        setShowForm(true)
    }

    function handleCancel() {
        setShowForm(false)
        setEditing(null)
        setError(null)
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">Serviços</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Gere os serviços que ofereces aos clientes
                    </p>
                </div>
                {!showForm && (
                    <button
                        onClick={() => setShowForm(true)}
                        className="flex items-center gap-2 h-9 px-4 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition"
                    >
                        <Plus size={15} />
                        Novo serviço
                    </button>
                )}
            </div>

            {showForm && (
                <div className="bg-card border border-border rounded-xl p-5">
                    <h2 className="text-sm font-semibold mb-4">
                        {editing ? 'Editar serviço' : 'Novo serviço'}
                    </h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium">Nome</label>
                                <input
                                    name="name"
                                    defaultValue={editing?.name}
                                    placeholder="Ex: Lavagem exterior"
                                    required
                                    className="w-full h-10 px-3 rounded-lg border border-input bg-background text-sm outline-none focus:ring-2 focus:ring-ring transition"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium">Descrição</label>
                                <input
                                    name="description"
                                    defaultValue={editing?.description ?? ''}
                                    placeholder="Opcional"
                                    className="w-full h-10 px-3 rounded-lg border border-input bg-background text-sm outline-none focus:ring-2 focus:ring-ring transition"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium">Duração (minutos)</label>
                                <input
                                    name="duration"
                                    type="number"
                                    defaultValue={editing?.duration ?? 60}
                                    min={15}
                                    step={15}
                                    required
                                    className="w-full h-10 px-3 rounded-lg border border-input bg-background text-sm outline-none focus:ring-2 focus:ring-ring transition"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium">Preço (€)</label>
                                <input
                                    name="price"
                                    type="number"
                                    defaultValue={editing?.price ?? ''}
                                    min={0}
                                    step={0.5}
                                    required
                                    className="w-full h-10 px-3 rounded-lg border border-input bg-background text-sm outline-none focus:ring-2 focus:ring-ring transition"
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-lg">
                                {error}
                            </div>
                        )}

                        <div className="flex gap-2">
                            <button
                                type="submit"
                                disabled={loading}
                                className="h-9 px-4 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition disabled:opacity-50"
                            >
                                {loading ? 'A guardar...' : editing ? 'Guardar alterações' : 'Criar serviço'}
                            </button>
                            <button
                                type="button"
                                onClick={handleCancel}
                                className="h-9 px-4 rounded-lg text-sm border border-border hover:bg-muted transition"
                            >
                                Cancelar
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {services.length === 0 && !showForm ? (
                <div className="bg-card border border-border rounded-xl p-10 text-center">
                    <p className="text-sm text-muted-foreground">Ainda não tens serviços criados.</p>
                    <p className="text-xs text-muted-foreground mt-1">
                        Cria o teu primeiro serviço para começar a receber marcações.
                    </p>
                </div>
            ) : (
                <div className="grid gap-3">
                    {services.map((service) => (
                        <div
                            key={service.id}
                            className="bg-card border border-border rounded-xl px-5 py-4 flex items-center justify-between"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                                    <span className="text-base">🚗</span>
                                </div>
                                <div>
                                    <p className="text-sm font-medium">{service.name}</p>
                                    {service.description && (
                                        <p className="text-xs text-muted-foreground mt-0.5">{service.description}</p>
                                    )}
                                    <div className="flex items-center gap-3 mt-1.5">
                                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                            <Clock size={11} />
                                            {service.duration} min
                                        </span>
                                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                            <Euro size={11} />
                                            {service.price.toFixed(2)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={() => handleEdit(service)}
                                    className="w-8 h-8 rounded-lg hover:bg-muted flex items-center justify-center transition"
                                >
                                    <Pencil size={14} className="text-muted-foreground" />
                                </button>
                                <button
                                    onClick={() => handleDelete(service.id)}
                                    className="w-8 h-8 rounded-lg hover:bg-destructive/10 flex items-center justify-center transition"
                                >
                                    <Trash2 size={14} className="text-muted-foreground hover:text-destructive" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}