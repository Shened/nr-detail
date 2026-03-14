import Link from 'next/link'
import { CalendarDays, Bell, LayoutDashboard, Star, ArrowRight, Check } from 'lucide-react'

const features = [
    {
        icon: CalendarDays,
        title: 'Marcações online 24/7',
        description: 'Os teus clientes marcam a qualquer hora, sem precisarem de te ligar ou enviar mensagem.',
    },
    {
        icon: Bell,
        title: 'Lembretes automáticos',
        description: 'Envia confirmações e lembretes por email automaticamente. Menos faltas, mais receita.',
    },
    {
        icon: LayoutDashboard,
        title: 'Dashboard completo',
        description: 'Gere marcações, serviços e clientes num só lugar. Simples e rápido.',
    },
]

const testimonials = [
    {
        name: 'João Silva',
        business: 'Barbearia Moderna, Porto',
        text: 'Deixei de perder tempo ao telefone. Os clientes marcam sozinhos e eu foco-me no trabalho.',
    },
    {
        name: 'Ana Ferreira',
        business: 'Studio Pilates Lisboa',
        text: 'Setup em menos de 5 minutos. Já não consigo imaginar gerir as marcações de outra forma.',
    },
    {
        name: 'Rui Santos',
        business: 'NR Detail, Gaia',
        text: 'Os clientes adoram poder marcar online. As faltas reduziram quase a zero com os lembretes.',
    },
]

const plans = [
    {
        name: 'Starter',
        price: '10',
        description: 'Para começar',
        features: ['1 negócio', 'Até 50 marcações/mês', 'Página pública', 'Email de confirmação'],
        cta: 'Começar grátis',
        highlight: false,
    },
    {
        name: 'Pro',
        price: '25',
        description: 'O mais popular',
        features: ['1 negócio', 'Marcações ilimitadas', 'Lembretes por SMS', 'Pagamentos online', 'Suporte prioritário'],
        cta: 'Começar grátis',
        highlight: true,
    },
    {
        name: 'Business',
        price: '49',
        description: 'Para crescer',
        features: ['Até 5 negócios', 'Tudo do Pro', 'Relatórios avançados', 'API access', 'Onboarding dedicado'],
        cta: 'Falar com vendas',
        highlight: false,
    },
]

export default function BusinessLandingPage() {
    return (
        <div className="min-h-screen bg-background">
            <header className="border-b border-border sticky top-0 bg-background z-10">
                <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2 font-semibold text-lg">
                        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="9" /><path d="M5 12h14M12 5l4 7-4 7-4-7z" />
                            </svg>
                        </div>
                        AutoBooking
                    </Link>
                    <div className="flex items-center gap-3">
                        <Link
                            href="/"
                            className="text-sm text-muted-foreground hover:text-foreground transition hidden sm:block"
                        >
                            Para clientes
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
                            Começar grátis
                        </Link>
                    </div>
                </div>
            </header>

            <section className="max-w-5xl mx-auto px-6 pt-24 pb-20 text-center">
                <div className="inline-flex items-center gap-2 bg-muted px-3 py-1.5 rounded-full text-xs font-medium text-muted-foreground mb-6">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                    Mais de 200 negócios já usam o AutoBooking
                </div>
                <h1 className="text-5xl font-bold tracking-tight max-w-3xl mx-auto leading-tight">
                    Marcações online para o teu negócio
                </h1>
                <p className="text-lg text-muted-foreground mt-6 max-w-xl mx-auto leading-relaxed">
                    Chega de gerir marcações pelo WhatsApp. O AutoBooking dá ao teu negócio uma página profissional onde os clientes marcam sozinhos.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center mt-10">
                    <Link
                        href="/register"
                        className="h-12 px-8 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:opacity-90 transition flex items-center justify-center gap-2"
                    >
                        Criar conta grátis <ArrowRight size={16} />
                    </Link>
                    <Link
                        href="#como-funciona"
                        className="h-12 px-8 border border-border rounded-xl text-sm font-medium hover:bg-muted transition flex items-center justify-center"
                    >
                        Ver como funciona
                    </Link>
                </div>
                <p className="text-xs text-muted-foreground mt-4">Sem cartão de crédito · Setup em 5 minutos</p>
            </section>

            <section className="border-y border-border bg-muted/30 py-4">
                <div className="max-w-5xl mx-auto px-6">
                    <div className="flex flex-wrap justify-center gap-8 text-sm text-muted-foreground">
                        {['Barbearias', 'Lavagens Auto', 'Estúdios de Tatuagem', 'Fisioterapia', 'Personal Trainers', 'Salões de Beleza'].map((item) => (
                            <span key={item}>{item}</span>
                        ))}
                    </div>
                </div>
            </section>

            <section id="como-funciona" className="max-w-5xl mx-auto px-6 py-24">
                <div className="text-center mb-14">
                    <h2 className="text-3xl font-bold tracking-tight">Tudo o que precisas</h2>
                    <p className="text-muted-foreground mt-3 max-w-md mx-auto">
                        Uma plataforma simples e completa para gerir o teu negócio.
                    </p>
                </div>
                <div className="grid md:grid-cols-3 gap-6">
                    {features.map((feature) => {
                        const Icon = feature.icon
                        return (
                            <div key={feature.title} className="bg-card border border-border rounded-2xl p-6">
                                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                                    <Icon size={20} className="text-primary" />
                                </div>
                                <h3 className="font-semibold mb-2">{feature.title}</h3>
                                <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
                            </div>
                        )
                    })}
                </div>
            </section>

            <section className="bg-muted/30 border-y border-border py-24">
                <div className="max-w-5xl mx-auto px-6">
                    <div className="text-center mb-14">
                        <h2 className="text-3xl font-bold tracking-tight">O que dizem os nossos clientes</h2>
                    </div>
                    <div className="grid md:grid-cols-3 gap-6">
                        {testimonials.map((t) => (
                            <div key={t.name} className="bg-card border border-border rounded-2xl p-6">
                                <div className="flex gap-0.5 mb-4">
                                    {Array.from({ length: 5 }).map((_, i) => (
                                        <Star key={i} size={14} className="fill-amber-400 text-amber-400" />
                                    ))}
                                </div>
                                <p className="text-sm leading-relaxed mb-4">"{t.text}"</p>
                                <div>
                                    <p className="text-sm font-medium">{t.name}</p>
                                    <p className="text-xs text-muted-foreground">{t.business}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section id="precos" className="max-w-5xl mx-auto px-6 py-24">
                <div className="text-center mb-14">
                    <h2 className="text-3xl font-bold tracking-tight">Preços simples e transparentes</h2>
                    <p className="text-muted-foreground mt-3">14 dias grátis em qualquer plano. Sem surpresas.</p>
                </div>
                <div className="grid md:grid-cols-3 gap-6">
                    {plans.map((plan) => (
                        <div
                            key={plan.name}
                            className={`rounded-2xl p-6 flex flex-col ${plan.highlight
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-card border border-border'
                                }`}
                        >
                            <div className="mb-6">
                                <p className={`text-xs font-medium mb-1 ${plan.highlight ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                                    {plan.description}
                                </p>
                                <h3 className="text-xl font-bold">{plan.name}</h3>
                                <div className="mt-3 flex items-baseline gap-1">
                                    <span className="text-4xl font-bold">{plan.price}€</span>
                                    <span className={`text-sm ${plan.highlight ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>/mês</span>
                                </div>
                            </div>
                            <ul className="space-y-2.5 flex-1 mb-6">
                                {plan.features.map((f) => (
                                    <li key={f} className="flex items-center gap-2 text-sm">
                                        <Check size={14} className={plan.highlight ? 'text-primary-foreground' : 'text-primary'} />
                                        {f}
                                    </li>
                                ))}
                            </ul>
                            <Link
                                href="/register"
                                className={`h-10 rounded-xl text-sm font-medium flex items-center justify-center transition ${plan.highlight
                                    ? 'bg-primary-foreground text-primary hover:opacity-90'
                                    : 'bg-primary text-primary-foreground hover:opacity-90'
                                    }`}
                            >
                                {plan.cta}
                            </Link>
                        </div>
                    ))}
                </div>
            </section>

            <section className="border-t border-border bg-muted/30 py-24">
                <div className="max-w-2xl mx-auto px-6 text-center">
                    <h2 className="text-3xl font-bold tracking-tight">Pronto para começar?</h2>
                    <p className="text-muted-foreground mt-3 mb-8">
                        Cria a tua conta em menos de 2 minutos e começa a receber marcações hoje.
                    </p>
                    <Link
                        href="/register"
                        className="h-12 px-8 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:opacity-90 transition inline-flex items-center gap-2"
                    >
                        Criar conta grátis <ArrowRight size={16} />
                    </Link>
                    <p className="text-xs text-muted-foreground mt-4">Sem cartão de crédito · Cancela quando quiseres</p>
                </div>
            </section>

            <footer className="border-t border-border py-8">
                <div className="max-w-5xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <Link href="/" className="flex items-center gap-2 font-semibold">
                        <div className="w-6 h-6 rounded-md bg-primary flex items-center justify-center">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="9" /><path d="M5 12h14M12 5l4 7-4 7-4-7z" />
                            </svg>
                        </div>
                        AutoBooking
                    </Link>
                    <p className="text-xs text-muted-foreground">© 2025 AutoBooking. Feito em Portugal 🇵🇹</p>
                </div>
            </footer>
        </div>
    )
}