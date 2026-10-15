'use client'

import React, { useMemo } from 'react'
import { motion } from 'framer-motion'
import { Activity, CheckCircle, XCircle, Clock } from 'lucide-react'

interface MonitorSummary {
  status: string
  lastResponseTime?: number | null
}

interface StatsRowProps {
  monitors: MonitorSummary[]
}

export function StatsRow({ monitors }: StatsRowProps) {
  const stats = useMemo(() => {
    const total = monitors.length
    const online = monitors.filter((m) => m.status === 'up').length
    const offline = monitors.filter((m) => m.status === 'down').length

    const measured = monitors.filter(
      (m) => typeof m.lastResponseTime === 'number' && m.lastResponseTime !== null && m.lastResponseTime > 0
    )
    const avgResponse =
      measured.length > 0
        ? Math.round(measured.reduce((acc, m) => acc + (m.lastResponseTime || 0), 0) / measured.length)
        : 0

    return [
      {
        id: 'total',
        label: 'Total Monitors',
        value: total,
        unit: '',
        icon: Activity,
        color: '#2979ff',
        bg: 'rgba(41, 121, 255, 0.12)',
        border: 'rgba(41, 121, 255, 0.2)',
      },
      {
        id: 'online',
        label: 'Online',
        value: online,
        unit: '',
        icon: CheckCircle,
        color: '#00e676',
        bg: 'rgba(0, 230, 118, 0.12)',
        border: 'rgba(0, 230, 118, 0.2)',
      },
      {
        id: 'offline',
        label: 'Offline',
        value: offline,
        unit: '',
        icon: XCircle,
        color: '#ff1744',
        bg: 'rgba(255, 23, 68, 0.12)',
        border: 'rgba(255, 23, 68, 0.2)',
      },
      {
        id: 'avg',
        label: 'Avg Response',
        value: avgResponse,
        unit: 'ms',
        icon: Clock,
        color: '#2979ff',
        bg: 'rgba(41, 121, 255, 0.12)',
        border: 'rgba(41, 121, 255, 0.2)',
      },
    ]
  }, [monitors])

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((item, index) => {
        const Icon = item.icon
        return (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.08, duration: 0.35, ease: 'easeOut' }}
            className="glass-card relative overflow-hidden p-5"
          >
            {/* Top row with icon */}
            <div className="flex items-center justify-between mb-3">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-xl"
                style={{
                  backgroundColor: item.bg,
                  border: `1px solid ${item.border}`,
                }}
              >
                <Icon size={20} style={{ color: item.color }} />
              </div>
            </div>

            {/* Metric Value */}
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-extrabold tracking-tight text-white">
                {item.value}
              </span>
              {item.unit && (
                <span className="text-sm font-medium text-[#666680]">{item.unit}</span>
              )}
            </div>

            {/* Label */}
            <div className="mt-1 text-xs font-medium text-[#8e8ea0] tracking-wide">
              {item.label}
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}
