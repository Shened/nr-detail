import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { ArrowRight, Search, MapPin, Clock } from 'lucide-react'

const CATEGORIES = [
  'Todos', 'Lavagens Auto', 'Barbearias', 'Tatuagens',
  'Fisioterapia', 'Personal Trainer', 'Beleza',
]

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string }>
}) {
  const { q, category } = await searchParams

  const businesses = await prisma.business.findMany({
    where: {
      AND: [
        q ? {
          OR: [
            { name: { contains: q, mode: 'insensitive' } },
            { description: { contains: q, mode: 'insensitive' } },
          ],
        } : {},
      ],
    },
    include: {
      services: { where: { active: true }, take: 3 },
      _count: { select: { bookings: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border sticky top-0 bg-background z-10">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 font-semibold text-lg">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="9" /><path d="M5 12h14M12 5l4 7-4 7-4-7z" />
              </svg>
            </div>
            AutoBooking
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/business"
              className="text-sm text-muted-foreground hover:text-foreground transition hidden sm:block"
            >
              Para negócios
            </Link>
            <Link
              href="/login"
              className="h-9 px-4 border border-border rounded-lg text-sm font-medium hover:bg-muted transition flex items-center"
            >
              Entrar
            </Link>
            <Link
              href="/register"
              className="h-9 px-4 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition flex items-center"
            >
              Registar negócio
            </Link>
          </div>
        </div>
      </header>

      <section className="bg-zinc-900 text-white py-16">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h1 className="text-4xl font-bold tracking-tight mb-3">
            Encontra e marca o teu serviço
          </h1>
          <p className="text-zinc-400 mb-8">
            Barbearias, lavagens auto, tatuagens e muito mais — marca online em segundos.
          </p>
          <form method="GET" action="/" className="flex gap-2 max-w-xl mx-auto">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                name="q"
                defaultValue={q}
                type="text"
                placeholder="Pesquisar negócio ou serviço..."
                className="w-full h-12 pl-10 pr-4 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-zinc-400 text-sm outline-none focus:border-white/40 transition"
              />
            </div>
            <button
              type="submit"
              className="h-12 px-6 bg-white text-zinc-900 rounded-xl text-sm font-semibold hover:bg-zinc-100 transition flex items-center gap-2"
            >
              Pesquisar
            </button>
          </form>
        </div>
      </section>

      <section className="border-b border-border bg-muted/30">
        <div className="max-w-5xl mx-auto px-6">
          <div className="flex gap-2 overflow-x-auto py-3 scrollbar-none">
            {CATEGORIES.map((cat) => (
              <Link
                key={cat}
                href={cat === 'Todos' ? '/' : `/?category=${encodeURIComponent(cat)}`}
                className={`flex-shrink-0 h-8 px-4 rounded-full text-xs font-medium transition flex items-center justify-center ${(cat === 'Todos' && !category) || category === cat
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-card border border-border hover:bg-muted text-muted-foreground'
                  }`}
              >
                {cat}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-sm font-semibold text-muted-foreground">
            {q ? `Resultados para "${q}"` : 'Todos os negócios'} · {businesses.length} encontrados
          </h2>
        </div>

        {businesses.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground">Nenhum negócio encontrado.</p>
            <Link href="/" className="text-sm text-primary hover:underline mt-2 inline-block">
              Ver todos
            </Link>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {businesses.map((business) => (
              <Link
                key={business.id}
                href={`/${business.slug}`}
                className="bg-card border border-border rounded-2xl overflow-hidden hover:border-primary/40 hover:shadow-sm transition group"
              >
                <div className="h-32 bg-gradient-to-br from-zinc-800 to-zinc-600 flex items-end p-4">
                  <div className="w-12 h-12 rounded-xl bg-primary border-2 border-white flex items-center justify-center">
                    <span className="text-primary-foreground text-lg font-bold">
                      {business.name.charAt(0)}
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-sm group-hover:text-primary transition">
                    {business.name}
                  </h3>
                  {business.description && (
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {business.description}
                    </p>
                  )}
                  {business.services.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {business.services.map((s) => (
                        <span
                          key={s.id}
                          className="text-xs bg-muted px-2 py-0.5 rounded-full text-muted-foreground"
                        >
                          {s.name}
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="flex items-center justify-between mt-4">
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock size={11} />
                      {business._count.bookings} marcações
                    </span>
                    <span className="text-xs text-primary font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                      Marcar <ArrowRight size={11} />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="border-t border-border bg-muted/30 py-12 mt-8">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-xl font-bold mb-2">Tens um negócio?</h2>
          <p className="text-sm text-muted-foreground mb-6">
            Junta-te a centenas de negócios que já recebem marcações online.
          </p>
          <Link
            href="/register"
            className="h-11 px-8 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:opacity-90 transition inline-flex items-center gap-2"
          >
            Registar o meu negócio <ArrowRight size={15} />
          </Link>
        </div>
      </section>

      <footer className="border-t border-border py-6">
        <div className="max-w-5xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">© 2025 AutoBooking · Feito em Portugal 🇵🇹</p>
          <Link href="/business" className="text-xs text-muted-foreground hover:underline underline-offset-4">
            Tens um negócio? Regista-o aqui
          </Link>
        </div>
      </footer>
    </div>
  )
}