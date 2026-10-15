'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { Sidebar } from '@/components/Sidebar'
import { StatsRow } from '@/components/StatsRow'
import { MonitorCard, MonitorItem } from '@/components/MonitorCard'
import { AddMonitorModal } from '@/components/AddMonitorModal'
import { MonitorDetailPanel } from '@/components/MonitorDetailPanel'
import { NotificationSettingsModal } from '@/components/NotificationSettingsModal'
import { Plus, Activity, RefreshCw, Sparkles, Bell } from 'lucide-react'

export default function DashboardPage() {
  const [monitors, setMonitors] = useState<MonitorItem[]>([])
  const [loading, setLoading] = useState(true)
  const [pinging, setPinging] = useState(false)
  const [selectedMonitor, setSelectedMonitor] = useState<MonitorItem | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showSettingsModal, setShowSettingsModal] = useState(false)
  const hasInitialized = useRef(false)

  const fetchMonitors = useCallback(async () => {
    try {
      const res = await fetch('/api/monitors', { cache: 'no-store' })
      if (res.ok) {
        const data = await res.json()
        setMonitors(data.monitors || [])
      }
    } catch (err) {
      console.error('Failed to fetch monitors', err)
    } finally {
      setLoading(false)
    }
  }, [])

  const triggerPing = useCallback(async () => {
    try {
      setPinging(true)
      await fetch('/api/ping', { method: 'POST' })
      await fetchMonitors()
    } catch (err) {
      console.error('Failed to trigger ping', err)
    } finally {
      setPinging(false)
    }
  }, [fetchMonitors])

  // Single, clean initialization on mount
  useEffect(() => {
    if (hasInitialized.current) return
    hasInitialized.current = true

    fetchMonitors()

    // 60-second background polling
    const intervalId = setInterval(() => {
      fetch('/api/ping', { method: 'POST' })
        .then(() => fetchMonitors())
        .catch(console.error)
    }, 60000)

    return () => {
      clearInterval(intervalId)
    }
  }, [fetchMonitors])

  const handleCloseSettingsModal = () => {
    setShowSettingsModal(false)
    try {
      localStorage.setItem('pulse_alerts_configured', 'true')
    } catch {}
  }

  const handleAddMonitor = async (data: {
    name: string
    url: string
    interval: number
    method: string
  }) => {
    const res = await fetch('/api/monitors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })

    if (!res.ok) {
      const errorData = await res.json()
      throw new Error(errorData.error || 'Failed to add monitor')
    }

    await fetchMonitors()
  }

  const handleDeleteMonitor = async (id: string) => {
    const res = await fetch(`/api/monitors/${id}`, {
      method: 'DELETE',
    })

    if (!res.ok) {
      throw new Error('Failed to delete monitor')
    }

    setMonitors((prev) => prev.filter((m) => m.id !== id))
    setSelectedMonitor(null)
  }

  const handleSeedDefaults = async () => {
    const defaultServices = [
      { name: 'Google Search', url: 'https://www.google.com', interval: 60, method: 'GET' },
      { name: 'GitHub API', url: 'https://api.github.com', interval: 60, method: 'GET' },
      { name: 'Cloudflare DNS', url: 'https://1.1.1.1', interval: 60, method: 'GET' },
    ]

    setLoading(true)
    for (const service of defaultServices) {
      try {
        await fetch('/api/monitors', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(service),
        })
      } catch (err) {
        console.error('Seed error', err)
      }
    }
    await fetchMonitors()
    await triggerPing()
  }

  return (
    <div className="relative min-h-screen bg-[#0a0a0f] text-[#e0e0e0]">
      {/* Ambient background glow */}
      <div className="gradient-mesh" />

      {/* Persistent Left Sidebar */}
      <Sidebar onOpenSettings={() => setShowSettingsModal(true)} />

      {/* Main content offset for sidebar */}
      <main className="pl-16">
        <div className="mx-auto max-w-7xl px-6 py-8 relative z-10">
          {/* Header row */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-extrabold tracking-tight text-white">
                  Pulse Monitor
                </h1>
                <span className="flex items-center gap-1.5 rounded-full border border-[#2979ff]/30 bg-[#2979ff]/10 px-2.5 py-0.5 text-[11px] font-semibold text-[#2979ff]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#00e676] pulse-green" />
                  Live Sync
                </span>
              </div>
              <p className="mt-1 text-sm text-[#666680]">
                High-frequency health tracking & real-time HTTP metrics
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowSettingsModal(true)}
                title="Configure alert channels (Email & Discord)"
                className="flex items-center gap-2 rounded-xl border border-white/10 bg-[#12121a] px-3.5 py-2.5 text-xs font-semibold text-[#a0a0b8] transition-all hover:bg-white/5 hover:text-white active:scale-95"
              >
                <Bell size={14} className="text-[#2979ff]" />
                <span>Alerts & Notifications</span>
              </button>

              <button
                type="button"
                onClick={triggerPing}
                disabled={pinging}
                title="Ping all endpoints now"
                className="flex items-center gap-2 rounded-xl border border-white/10 bg-[#12121a] px-3.5 py-2.5 text-xs font-semibold text-[#a0a0b8] transition-all hover:bg-white/5 hover:text-white active:scale-95 disabled:opacity-50"
              >
                <RefreshCw size={14} className={pinging ? 'animate-spin text-[#2979ff]' : ''} />
                <span>{pinging ? 'Pinging...' : 'Check Now'}</span>
              </button>

              <button
                type="button"
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#2979ff] to-[#1565c0] px-4 py-2.5 text-xs font-semibold text-white shadow-[0_0_20px_rgba(41,121,255,0.35)] transition-all hover:shadow-[0_0_30px_rgba(41,121,255,0.5)] active:scale-95"
              >
                <Plus size={16} />
                <span>Add Monitor</span>
              </button>
            </div>
          </div>

          {/* Top Statistics Row */}
          <StatsRow monitors={monitors} />

          {/* Monitors Grid */}
          {monitors.length > 0 && (
            <div className="mt-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-[#8e8ea0]">
                  Monitored Endpoints ({monitors.length})
                </h2>
                <span className="text-xs text-[#666680]">
                  Refreshes automatically every 60s
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {monitors.map((m, i) => (
                  <MonitorCard
                    key={m.id}
                    monitor={m}
                    index={i}
                    onClick={() => setSelectedMonitor(m)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Empty state when no monitors */}
          {monitors.length === 0 && !loading && (
            <div className="mt-12 flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-[#12121a]/40 px-6 py-20 text-center backdrop-blur-sm">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-[#2979ff]/20 bg-[#2979ff]/10 text-[#2979ff] shadow-[0_0_30px_rgba(41,121,255,0.15)]">
                <Activity size={32} />
              </div>

              <h3 className="mt-5 text-xl font-bold text-white">No monitors configured yet</h3>
              <p className="mt-1.5 max-w-sm text-sm text-[#666680]">
                Add an endpoint or API to monitor response times, uptime degradation, and HTTP status codes.
              </p>

              <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(true)}
                  className="flex items-center gap-2 rounded-xl bg-[#2979ff] px-5 py-2.5 text-xs font-semibold text-white shadow-lg shadow-[#2979ff]/30 transition-all hover:bg-[#1565c0]"
                >
                  <Plus size={16} />
                  <span>Add First Monitor</span>
                </button>

                <button
                  type="button"
                  onClick={handleSeedDefaults}
                  className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-medium text-[#a0a0b8] transition-colors hover:bg-white/10 hover:text-white"
                >
                  <Sparkles size={14} className="text-[#00e676]" />
                  <span>Add Starter Endpoints</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Add Monitor Modal */}
      <AddMonitorModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={handleAddMonitor}
      />

      {/* Notification Settings Modal (Email & Discord) */}
      <NotificationSettingsModal
        isOpen={showSettingsModal}
        onClose={handleCloseSettingsModal}
      />

      {/* Monitor Detail Panel */}
      {selectedMonitor && (
        <MonitorDetailPanel
          monitor={selectedMonitor}
          onClose={() => setSelectedMonitor(null)}
          onDelete={handleDeleteMonitor}
        />
      )}
    </div>
  )
}
