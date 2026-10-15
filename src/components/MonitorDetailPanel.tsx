'use client'

import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ExternalLink, Trash2, Clock, RefreshCw, AlertTriangle, CheckCircle2 } from 'lucide-react'
import { StatusBadge } from './StatusBadge'
import { ResponseTimeChart } from './ResponseTimeChart'
import { MonitorItem } from './MonitorCard'

interface MonitorDetailPanelProps {
  monitor: MonitorItem
  onClose: () => void
  onDelete: (id: string) => Promise<void>
}

interface HeartbeatRecord {
  id: string
  status: string
  responseTime: number
  statusCode: number | null
  message: string | null
  createdAt: string
}

export function MonitorDetailPanel({ monitor, onClose, onDelete }: MonitorDetailPanelProps) {
  const [heartbeats, setHeartbeats] = useState<HeartbeatRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [stats, setStats] = useState<{
    avgResponseTime: number
    uptime: number
    totalChecks: number
  }>({
    avgResponseTime: monitor.lastResponseTime || 0,
    uptime: monitor.uptime24h || 100,
    totalChecks: 0,
  })

  const loadHeartbeats = async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/heartbeat/${monitor.id}?hours=24`)
      if (res.ok) {
        const data = await res.json()
        setHeartbeats(data.heartbeats || [])
        if (data.stats) {
          setStats(data.stats)
        }
      }
    } catch (err) {
      console.error('Failed to load heartbeats', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadHeartbeats()
  }, [monitor.id])

  const handleDelete = async () => {
    if (!confirmDelete) {
      setConfirmDelete(true)
      return
    }

    try {
      setDeleting(true)
      await onDelete(monitor.id)
      onClose()
    } catch (err) {
      console.error('Failed to delete monitor', err)
      setDeleting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
      />

      {/* Slide-over panel */}
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 280 }}
        className="relative z-10 flex h-full w-full max-w-[500px] flex-col border-l border-white/[0.08] bg-[#0a0a0f] p-6 shadow-2xl overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 border-b border-white/[0.06] pb-4">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h2 className="truncate text-2xl font-bold text-white tracking-tight">
                {monitor.name}
              </h2>
              <StatusBadge status={monitor.status} size="sm" />
            </div>
            <a
              href={monitor.url}
              target="_blank"
              rel="noreferrer"
              className="mt-1 inline-flex items-center gap-1.5 text-xs text-[#2979ff] hover:underline"
            >
              <span className="truncate">{monitor.url}</span>
              <ExternalLink size={12} className="shrink-0" />
            </a>
          </div>

          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[#666680] hover:bg-white/5 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Response Time Chart Section */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-[#8e8ea0]">
              Response Time (Last 24h)
            </h3>
            <button
              onClick={loadHeartbeats}
              disabled={loading}
              title="Refresh"
              className="text-[#666680] hover:text-white transition-colors"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>

          <div className="rounded-xl border border-white/[0.06] bg-[#12121a]/80 p-3">
            <ResponseTimeChart heartbeats={heartbeats} height={200} />
          </div>
        </div>

        {/* Statistics Grid */}
        <div className="mt-6">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-[#8e8ea0] mb-3">
            Service Metrics
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-white/[0.06] bg-[#12121a]/70 p-3.5">
              <div className="text-xs text-[#666680]">Avg Response Time</div>
              <div className="mt-1 text-xl font-bold text-white">
                {stats.avgResponseTime} <span className="text-xs font-normal text-[#666680]">ms</span>
              </div>
            </div>

            <div className="rounded-xl border border-white/[0.06] bg-[#12121a]/70 p-3.5">
              <div className="text-xs text-[#666680]">Uptime (24h)</div>
              <div className="mt-1 text-xl font-bold text-[#00e676]">
                {monitor.uptime24h}%
              </div>
            </div>

            <div className="rounded-xl border border-white/[0.06] bg-[#12121a]/70 p-3.5">
              <div className="text-xs text-[#666680]">Uptime (7d)</div>
              <div className="mt-1 text-xl font-bold text-white">
                {monitor.uptime7d}%
              </div>
            </div>

            <div className="rounded-xl border border-white/[0.06] bg-[#12121a]/70 p-3.5">
              <div className="text-xs text-[#666680]">Uptime (30d)</div>
              <div className="mt-1 text-xl font-bold text-white">
                {monitor.uptime30d}%
              </div>
            </div>

            <div className="rounded-xl border border-white/[0.06] bg-[#12121a]/70 p-3.5">
              <div className="text-xs text-[#666680]">Total Checks</div>
              <div className="mt-1 text-xl font-bold text-white">
                {stats.totalChecks || heartbeats.length}
              </div>
            </div>

            <div className="rounded-xl border border-white/[0.06] bg-[#12121a]/70 p-3.5">
              <div className="text-xs text-[#666680]">Interval</div>
              <div className="mt-1 text-xl font-bold text-white">
                {monitor.interval} <span className="text-xs font-normal text-[#666680]">sec</span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Checks List */}
        <div className="mt-6 flex-1">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-[#8e8ea0] mb-3">
            Recent Heartbeats (Last 20)
          </h3>
          <div className="rounded-xl border border-white/[0.06] bg-[#12121a]/70 overflow-hidden divide-y divide-white/[0.04]">
            {heartbeats.slice(0, 20).map((h) => {
              const isUp = h.status === 'up'
              const date = new Date(h.createdAt)
              const timeStr = date.toLocaleTimeString()

              return (
                <div
                  key={h.id}
                  className="flex items-center justify-between px-3.5 py-2.5 text-xs hover:bg-white/[0.02]"
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`h-2 w-2 rounded-full shrink-0 ${
                        isUp ? 'bg-[#00e676]' : 'bg-[#ff1744]'
                      }`}
                    />
                    <span className="font-mono text-[#a0a0b8]">{timeStr}</span>
                    {h.statusCode && (
                      <span className="rounded bg-white/5 px-1.5 py-0.5 text-[10px] text-[#666680]">
                        {h.statusCode}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-white">{h.responseTime}ms</span>
                    <span
                      className={`text-[10px] font-bold uppercase ${
                        isUp ? 'text-[#00e676]' : 'text-[#ff1744]'
                      }`}
                    >
                      {h.status}
                    </span>
                  </div>
                </div>
              )
            })}

            {heartbeats.length === 0 && (
              <div className="py-6 text-center text-xs text-[#666680]">
                No check records recorded yet.
              </div>
            )}
          </div>
        </div>

        {/* Delete Monitor Section */}
        <div className="mt-8 border-t border-white/[0.06] pt-4">
          <button
            onClick={handleDelete}
            disabled={deleting}
            className={`flex w-full items-center justify-center gap-2 rounded-xl border py-2.5 text-xs font-semibold transition-all ${
              confirmDelete
                ? 'border-[#ff1744] bg-[#ff1744] text-white shadow-[0_0_20px_rgba(255,23,68,0.4)]'
                : 'border-[#ff1744]/30 bg-[#ff1744]/5 text-[#ff1744] hover:bg-[#ff1744]/15'
            }`}
          >
            <Trash2 size={15} />
            <span>
              {deleting
                ? 'Deleting...'
                : confirmDelete
                ? 'Click Again to Confirm Delete'
                : 'Delete Monitor'}
            </span>
          </button>
        </div>
      </motion.div>
    </div>
  )
}
