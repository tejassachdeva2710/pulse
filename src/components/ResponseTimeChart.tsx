'use client'

import React, { useMemo } from 'react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts'

interface HeartbeatItem {
  id?: string
  responseTime: number
  status?: string
  statusCode?: number | null
  message?: string | null
  createdAt: string
}

interface ResponseTimeChartProps {
  heartbeats: HeartbeatItem[]
  height?: number
}

export function ResponseTimeChart({ heartbeats, height = 280 }: ResponseTimeChartProps) {
  const chartData = useMemo(() => {
    // Sort oldest to newest for chronological left-to-right display
    const sorted = [...heartbeats].sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    )

    return sorted.map((h) => {
      const date = new Date(h.createdAt)
      const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      return {
        rawTime: h.createdAt,
        time: timeStr,
        responseTime: h.responseTime,
        status: h.status,
        statusCode: h.statusCode,
        message: h.message,
      }
    })
  }, [heartbeats])

  const avgResponseTime = useMemo(() => {
    if (chartData.length === 0) return 0
    const sum = chartData.reduce((acc, curr) => acc + curr.responseTime, 0)
    return Math.round(sum / chartData.length)
  }, [chartData])

  if (chartData.length === 0) {
    return (
      <div
        className="flex w-full items-center justify-center rounded-xl border border-white/5 bg-[#12121a]/50 text-sm text-[#666680]"
        style={{ height }}
      >
        No heartbeat history yet
      </div>
    )
  }

  return (
    <div className="w-full" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2979ff" stopOpacity={0.4} />
              <stop offset="100%" stopColor="#2979ff" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
          <XAxis
            dataKey="time"
            tick={{ fill: '#666680', fontSize: 11 }}
            axisLine={{ stroke: 'rgba(255,255,255,0.06)' }}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: '#666680', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            unit="ms"
          />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const data = payload[0].payload
                const isUp = data.status === 'up'
                return (
                  <div className="rounded-lg border border-white/10 bg-[#12121a] p-3 shadow-2xl backdrop-blur-md">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className={`h-2 w-2 rounded-full ${isUp ? 'bg-[#00e676]' : 'bg-[#ff1744]'}`} />
                      <span className="text-xs font-semibold uppercase tracking-wider text-[#a0a0b8]">
                        {data.status || (isUp ? 'up' : 'down')}
                      </span>
                      {data.statusCode && (
                        <span className="rounded bg-white/5 px-1.5 py-0.5 text-[10px] text-[#8e8ea0]">
                          {data.statusCode}
                        </span>
                      )}
                    </div>
                    <div className="text-lg font-bold text-white">
                      {data.responseTime} <span className="text-xs font-normal text-[#666680]">ms</span>
                    </div>
                    <div className="mt-1 text-[11px] text-[#666680]">{data.time}</div>
                    {data.message && (
                      <div className="mt-1 text-[10px] text-[#ff1744]">{data.message}</div>
                    )}
                  </div>
                )
              }
              return null
            }}
          />
          {avgResponseTime > 0 && (
            <ReferenceLine
              y={avgResponseTime}
              stroke="#666680"
              strokeDasharray="4 4"
              label={{
                value: `avg ${avgResponseTime}ms`,
                fill: '#8e8ea0',
                fontSize: 10,
                position: 'right',
              }}
            />
          )}
          <Area
            type="monotone"
            dataKey="responseTime"
            stroke="#2979ff"
            strokeWidth={2}
            fill="url(#chartGradient)"
            animationDuration={1000}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
