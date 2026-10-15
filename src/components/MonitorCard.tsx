'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { StatusBadge } from './StatusBadge'
import { UptimeBar, DayUptime } from './UptimeBar'
import { AreaChart, Area, ResponsiveContainer } from 'recharts'
import { ExternalLink } from 'lucide-react'

export interface MonitorItem {
  id: string
  name: string
  url: string
  interval: number
  method: string
  status: 'up' | 'down' | 'unknown' | string
  createdAt: string
  updatedAt: string
  lastChecked: string | null
  lastResponseTime: number | null
  lastStatusCode?: number | null
  lastMessage?: string | null
  uptime24h: number
  uptime7d: number
  uptime30d: number
  uptime90d: number
  recentHeartbeats?: { responseTime: number; status?: string }[]
  dailyUptime?: DayUptime[]
}

interface MonitorCardProps {
  monitor: MonitorItem
  index: number
  onClick?: () => void
}

export function MonitorCard({ monitor, index, onClick }: MonitorCardProps) {
  const sparklineData = React.useMemo(() => {
    if (monitor.recentHeartbeats && monitor.recentHeartbeats.length > 0) {
      return monitor.recentHeartbeats.map((h, i) => ({
        index: i,
        val: h.responseTime || 10,
      }))
    }
    // Default flat data if no checks yet
    return [
      { index: 0, val: monitor.lastResponseTime || 50 },
      { index: 1, val: monitor.lastResponseTime || 50 },
    ]
  }, [monitor.recentHeartbeats, monitor.lastResponseTime])

  const timeAgoText = React.useMemo(() => {
    if (!monitor.lastChecked) return 'Never checked'
    const diffSeconds = Math.max(0, Math.floor((Date.now() - new Date(monitor.lastChecked).getTime()) / 1000))
    if (diffSeconds < 60) return `Checked ${diffSeconds}s ago`
    const diffMinutes = Math.floor(diffSeconds / 60)
    if (diffMinutes < 60) return `Checked ${diffMinutes}m ago`
    const diffHours = Math.floor(diffMinutes / 60)
    return `Checked ${diffHours}h ago`
  }, [monitor.lastChecked])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4, ease: 'easeOut' }}
      onClick={onClick}
      className="glass-card group relative cursor-pointer overflow-hidden p-5 transition-all duration-300 hover:border-[#2979ff]/40 hover:shadow-[0_8px_30px_rgba(41,121,255,0.08)]"
    >
      {/* Top row */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h4 className="truncate font-bold text-white text-base tracking-tight group-hover:text-[#2979ff] transition-colors">
              {monitor.name}
            </h4>
            <span className="opacity-0 group-hover:opacity-100 transition-opacity text-[#666680]">
              <ExternalLink size={13} />
            </span>
          </div>
          <p className="mt-0.5 truncate text-xs text-[#666680] font-mono">
            {monitor.url.replace(/^https?:\/\//, '')}
          </p>
        </div>
        <StatusBadge status={monitor.status} size="sm" />
      </div>

      {/* Middle section: Response time and mini sparkline */}
      <div className="my-4 flex items-center justify-between">
        <div>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-extrabold text-white tracking-tight">
              {monitor.lastResponseTime !== null ? monitor.lastResponseTime : '—'}
            </span>
            <span className="text-xs font-medium text-[#666680]">ms</span>
          </div>
          <span className="text-[10px] uppercase tracking-wider text-[#8e8ea0] font-medium">
            Response Time
          </span>
        </div>

        {/* Mini sparkline chart */}
        <div className="h-10 w-28 overflow-hidden rounded">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={sparklineData}>
              <defs>
                <linearGradient id={`spark-${monitor.id}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2979ff" stopOpacity={0.45} />
                  <stop offset="100%" stopColor="#2979ff" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey="val"
                stroke="#2979ff"
                strokeWidth={1.8}
                fill={`url(#spark-${monitor.id})`}
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 90-day Uptime Bar */}
      <div className="pt-1">
        <UptimeBar days={monitor.dailyUptime} />
      </div>

      {/* Footer stats */}
      <div className="mt-3 flex items-center justify-between border-t border-white/[0.04] pt-2.5 text-[11px] text-[#666680]">
        <div className="flex items-center gap-1.5">
          <span className="text-[#8e8ea0]">Uptime (30d):</span>
          <span className="font-semibold text-white">{monitor.uptime30d}%</span>
        </div>
        <span>{timeAgoText}</span>
      </div>
    </motion.div>
  )
}
