'use client'

import React, { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import { UptimeBar } from '@/components/UptimeBar'
import { MonitorItem } from '@/components/MonitorCard'
import { ArrowLeft, CheckCircle2, AlertTriangle, ShieldCheck, RefreshCw } from 'lucide-react'

export default function PublicStatusPage() {
  const [monitors, setMonitors] = useState<MonitorItem[]>([])
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<string>('')

  const fetchStatus = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/monitors', { cache: 'no-store' })
      if (res.ok) {
        const data = await res.json()
        setMonitors(data.monitors || [])
        setLastUpdated(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }))
      }
    } catch (err) {
      console.error('Failed to load status', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStatus()
    const timer = setInterval(fetchStatus, 30000) // auto-refresh public status every 30s
    return () => clearInterval(timer)
  }, [])

  const { allUp, downCount, hasMonitors } = useMemo(() => {
    if (monitors.length === 0) return { allUp: true, downCount: 0, hasMonitors: false }
    const down = monitors.filter((m) => m.status === 'down').length
    return {
      allUp: down === 0,
      downCount: down,
      hasMonitors: true,
    }
  }, [monitors])

  return (
    <div className="relative min-h-screen bg-[#0a0a0f] text-[#e0e0e0]">
      {/* Background radial glow */}
      <div className="gradient-mesh" />

      <div className="relative z-10 mx-auto max-w-2xl px-6 py-12">
        {/* Back navigation & logo */}
        <div className="mb-10 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-medium text-[#666680] transition-colors hover:text-white"
          >
            <ArrowLeft size={14} />
            <span>Go to Admin Dashboard</span>
          </Link>

          <button
            onClick={fetchStatus}
            disabled={loading}
            className="inline-flex items-center gap-1.5 text-xs text-[#666680] hover:text-white transition-colors"
          >
            <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
            <span>{lastUpdated ? `Updated ${lastUpdated}` : 'Live'}</span>
          </button>
        </div>

        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2.5 mb-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#2979ff] to-[#00e676] shadow-lg shadow-[#2979ff]/25">
              <span className="text-base font-extrabold text-white">P</span>
            </div>
            <span className="text-2xl font-black tracking-tight text-white">
              Pulse
            </span>
          </div>
          <h2 className="text-sm font-medium text-[#8e8ea0]">
            System Status & Service Availability
          </h2>

          {/* Overall status banner */}
          <div className="mt-6">
            {!hasMonitors ? (
              <div className="rounded-2xl border border-white/10 bg-[#12121a]/60 p-5 shadow-lg backdrop-blur-md">
                <div className="flex items-center justify-center gap-2.5">
                  <span className="h-3 w-3 rounded-full bg-[#2979ff]" />
                  <span className="text-base font-semibold text-white">
                    System Initializing
                  </span>
                </div>
                <p className="mt-1 text-xs text-[#666680]">
                  No services configured yet. Return to the dashboard to add monitors.
                </p>
              </div>
            ) : allUp ? (
              <div className="rounded-2xl border border-[#00e676]/30 bg-[#00e676]/10 p-5 shadow-[0_0_35px_rgba(0,230,118,0.15)] backdrop-blur-md">
                <div className="flex items-center justify-center gap-2.5">
                  <span className="h-3 w-3 rounded-full bg-[#00e676] pulse-green shrink-0" />
                  <span className="text-base font-bold text-[#00e676]">
                    All Systems Operational
                  </span>
                </div>
                <p className="mt-1 text-xs text-[#00e676]/80">
                  All services are currently running smoothly with optimal latency.
                </p>
              </div>
            ) : (
              <div className="rounded-2xl border border-[#ff1744]/30 bg-[#ff1744]/10 p-5 shadow-[0_0_35px_rgba(255,23,68,0.15)] backdrop-blur-md">
                <div className="flex items-center justify-center gap-2.5">
                  <span className="h-3 w-3 rounded-full bg-[#ff1744] pulse-red shrink-0" />
                  <span className="text-base font-bold text-[#ff1744]">
                    Degraded Performance ({downCount} {downCount === 1 ? 'service' : 'services'} down)
                  </span>
                </div>
                <p className="mt-1 text-xs text-[#ff1744]/80">
                  One or more services are reporting failures or response timeouts.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Monitored Services List */}
        <div className="space-y-4">
          {monitors.map((monitor) => {
            const isUp = monitor.status === 'up'

            return (
              <div
                key={monitor.id}
                className="glass-card p-5 transition-all duration-200"
              >
                {/* Header row */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span
                      className={`h-2.5 w-2.5 rounded-full shrink-0 ${
                        isUp ? 'bg-[#00e676] pulse-green' : 'bg-[#ff1744] pulse-red'
                      }`}
                    />
                    <div>
                      <div className="font-bold text-white text-sm tracking-tight">
                        {monitor.name}
                      </div>
                      <div className="text-[11px] text-[#666680] font-mono">
                        {monitor.url.replace(/^https?:\/\//, '')}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs">
                    <div className="text-right">
                      <span className="font-semibold text-white">
                        {monitor.uptime30d}%
                      </span>
                      <span className="text-[10px] text-[#666680] block">
                        30d uptime
                      </span>
                    </div>

                    <div className="text-right pl-3 border-l border-white/[0.06]">
                      <span className="font-semibold text-white">
                        {monitor.lastResponseTime !== null ? `${monitor.lastResponseTime}ms` : '—'}
                      </span>
                      <span className="text-[10px] text-[#666680] block">
                        latency
                      </span>
                    </div>
                  </div>
                </div>

                {/* 90-day history bar */}
                <div className="mt-4 pt-3 border-t border-white/[0.04]">
                  <UptimeBar days={monitor.dailyUptime} />
                </div>
              </div>
            )
          })}
        </div>

        {/* Public Status Footer */}
        <div className="mt-14 text-center text-xs text-[#666680]">
          <p>
            Powered by{' '}
            <span className="font-semibold text-white tracking-wide">
              Pulse
            </span>{' '}
            — Self-Hosted Infrastructure Monitor
          </p>
          <p className="mt-1 text-[11px] text-[#4a4a5e]">
            This page provides continuous public transparency for service reliability.
          </p>
        </div>
      </div>
    </div>
  )
}
