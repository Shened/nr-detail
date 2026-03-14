export default function AuthLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="min-h-screen grid lg:grid-cols-2">
            <div className="hidden lg:flex flex-col bg-zinc-900 p-10 text-white">
                <div className="flex items-center gap-2 font-semibold text-lg">
                    <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="9" /><path d="M5 12h14M12 5l4 7-4 7-4-7z" />
                        </svg>
                    </div>
                    AutoBooking
                </div>
                <div className="mt-auto">
                    <blockquote className="space-y-2">
                        <p className="text-lg leading-relaxed text-white/80">
                            "Deixei de perder tempo ao telefone. Os clientes marcam sozinhos e eu foco-me no trabalho."
                        </p>
                        <footer className="text-sm text-white/50">— João Silva, Barbearia Moderna</footer>
                    </blockquote>
                </div>
            </div>
            <div className="flex items-center justify-center p-8">
                <div className="w-full max-w-sm">
                    {children}
                </div>
            </div>
        </div>
    )
}