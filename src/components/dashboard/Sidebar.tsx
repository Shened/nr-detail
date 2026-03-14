'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import {
    LayoutDashboard,
    CalendarDays,
    Wrench,
    Settings,
    LogOut,
    ExternalLink,
} from 'lucide-react'

const navItems = [
    { href: '/dashboard', label: 'Visão geral', icon: LayoutDashboard },
    { href: '/dashboard/bookings', label: 'Marcações', icon: CalendarDays },
    { href: '/dashboard/services', label: 'Serviços', icon: Wrench },
    { href: '/dashboard/settings', label: 'Configurações', icon: Settings },
]

interface Props {
    business: {
        name: string
        slug: string
    }
    user: {
        name?: string | null
        email?: string | null
    }
}

export default function Sidebar({ business, user }: Props) {
    const pathname = usePathname()

    return (
        <aside className="w-60 min-h-screen border-r border-border flex flex-col bg-card">
            <div className="p-5 border-b border-border">
                <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
                        <span className="text-primary-foreground text-xs font-semibold">
                            {business.name.charAt(0).toUpperCase()}
                        </span>
                    </div>
                    <div className="min-w-0">
                        <p className="text-sm font-semibold truncate">{business.name}</p>
                        <p className="text-xs text-muted-foreground truncate">/{business.slug}</p>
                    </div>
                </div>
            </div>

            <nav className="flex-1 p-3 space-y-0.5">
                {navItems.map((item) => {
                    const Icon = item.icon
                    const isActive = pathname === item.href
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${isActive
                                ? 'bg-primary text-primary-foreground font-medium'
                                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                                }`}
                        >
                            <Icon size={16} />
                            {item.label}
                        </Link>
                    )
                })}

                <div className="pt-2 mt-2 border-t border-border">
                    <Link
                        href={`/${business.slug}`}
                        className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                    >
                        <ExternalLink size={16} />
                        Ver página pública
                    </Link>
                </div>
            </nav>

            <div className="p-3 border-t border-border">
                <div className="flex items-center gap-3 px-3 py-2 mb-0.5">
                    <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-medium">
                            {user.name?.charAt(0).toUpperCase() ?? '?'}
                        </span>
                    </div>
                    <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium truncate">{user.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                    </div>
                </div>
                <button
                    onClick={() => signOut({ callbackUrl: '/login' })}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors w-full"
                >
                    <LogOut size={16} />
                    Sair
                </button>
            </div>
        </aside >
    )
}