'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Globe, Settings, Activity } from 'lucide-react'

interface SidebarProps {
  onOpenSettings?: () => void
}

export function Sidebar({ onOpenSettings }: SidebarProps) {
  const pathname = usePathname()

  const navItems = [
    {
      label: 'Dashboard',
      href: '/',
      icon: LayoutDashboard,
      active: pathname === '/',
    },
    {
      label: 'Status Page',
      href: '/status',
      icon: Globe,
      active: pathname === '/status',
    },
  ]

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-16 flex-col border-r border-white/[0.06] bg-[#08080d] select-none">
      {/* Brand Logo */}
      <div className="flex flex-col items-center pt-6">
        <Link
          href="/"
          className="group relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#2979ff] to-[#00e676] shadow-lg shadow-[#2979ff]/20 transition-transform hover:scale-105 active:scale-95"
          title="Pulse Monitoring"
        >
          <span className="font-extrabold text-white text-base tracking-tighter">P</span>
          <span className="absolute -bottom-1 -right-1 flex h-3 w-3 items-center justify-center rounded-full bg-[#08080d]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#00e676] pulse-green" />
          </span>
        </Link>
      </div>

      {/* Navigation Icons */}
      <nav className="flex flex-1 flex-col items-center gap-3 pt-8">
        {navItems.map((item) => {
          const Icon = item.icon
          return (
            <Link
              key={item.label}
              href={item.href}
              title={item.label}
              className={`relative flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-200 ${
                item.active
                  ? 'bg-[#2979ff]/15 text-[#2979ff] shadow-[0_0_15px_rgba(41,121,255,0.25)]'
                  : 'text-[#666680] hover:bg-white/[0.05] hover:text-white'
              }`}
            >
              <Icon size={20} strokeWidth={item.active ? 2.3 : 1.8} />
              {item.active && (
                <span className="absolute -left-[1px] h-5 w-[3px] rounded-r-full bg-[#2979ff]" />
              )}
            </Link>
          )
        })}

        <button
          type="button"
          onClick={onOpenSettings}
          title="Notification & Alert Settings"
          className="flex h-10 w-10 items-center justify-center rounded-xl text-[#666680] transition-colors hover:bg-white/[0.05] hover:text-[#2979ff]"
        >
          <Settings size={20} strokeWidth={1.8} />
        </button>
      </nav>

      {/* Footer Info / Links */}
      <div className="flex flex-col items-center gap-3 pb-6">
        <a
          href="https://github.com"
          target="_blank"
          rel="noreferrer"
          title="GitHub Repository"
          className="flex h-10 w-10 items-center justify-center rounded-xl text-[#666680] transition-colors hover:bg-white/[0.05] hover:text-white"
        >
          <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
            <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
          </svg>
        </a>
      </div>
    </aside>
  )
}
