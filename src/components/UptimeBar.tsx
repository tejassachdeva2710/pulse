'use client'

import React, { useState } from 'react'

export interface DayUptime {
  date: string
  uptime: number // -1 means no data, 0..100 percentage
}

interface UptimeBarProps {
  days?: DayUptime[]
}

export function UptimeBar({ days = [] }: UptimeBarProps) {
  const [hoveredDay, setHoveredDay] = useState<{
    date: string
    uptime: number
    x: number
  } | null>(null)

  // Ensure up to 90 bars (padded if fewer)
  const displayDays: DayUptime[] = React.useMemo(() => {
    if (days.length >= 90) {
      return days.slice(-90)
    }
    const emptyCount = 90 - days.length
    const emptyDays: DayUptime[] = Array.from({ length: emptyCount }, (_, i) => ({
      date: `${90 - i}d ago`,
      uptime: -1,
    }))
    return [...emptyDays, ...days]
  }, [days])

  const getBarColor = (uptime: number) => {
    if (uptime < 0) return '#1a1a2e'
    if (uptime >= 99) return '#00e676'
    if (uptime >= 95) return '#f9a825'
    return '#ff1744'
  }

  return (
    <div className="relative w-full select-none">
      {/* Floating Tooltip */}
      {hoveredDay && (
        <div
          className="pointer-events-none absolute -top-9 z-30 -translate-x-1/2 whitespace-nowrap rounded-md border border-white/10 bg-[#12121a] px-2.5 py-1 text-[11px] font-medium text-white shadow-xl backdrop-blur-md"
          style={{ left: `${hoveredDay.x}%` }}
        >
          <span className="text-[#a0a0b8]">{hoveredDay.date}: </span>
          <span
            className={
              hoveredDay.uptime < 0
                ? 'text-[#666680]'
                : hoveredDay.uptime >= 99
                ? 'text-[#00e676]'
                : hoveredDay.uptime >= 95
                ? 'text-[#f9a825]'
                : 'text-[#ff1744]'
            }
          >
            {hoveredDay.uptime < 0 ? 'No Data' : `${hoveredDay.uptime}%`}
          </span>
        </div>
      )}

      {/* Bar container */}
      <div className="flex h-7 w-full items-end gap-[1.5px] py-1">
        {displayDays.map((d, index) => {
          const isFirst = index === 0
          const isLast = index === displayDays.length - 1
          const barColor = getBarColor(d.uptime)
          const pct = ((index + 0.5) / displayDays.length) * 100

          return (
            <div
              key={`${d.date}-${index}`}
              onMouseEnter={() => setHoveredDay({ date: d.date, uptime: d.uptime, x: pct })}
              onMouseLeave={() => setHoveredDay(null)}
              className="group relative h-full flex-1 cursor-pointer transition-all duration-150 hover:scale-y-125"
              style={{
                backgroundColor: barColor,
                borderTopLeftRadius: isFirst ? '3px' : '1px',
                borderBottomLeftRadius: isFirst ? '3px' : '1px',
                borderTopRightRadius: isLast ? '3px' : '1px',
                borderBottomRightRadius: isLast ? '3px' : '1px',
              }}
            />
          )
        })}
      </div>

      {/* Label footer */}
      <div className="mt-1 flex items-center justify-between text-[11px] text-[#666680]">
        <span>90 days ago</span>
        <span>Today</span>
      </div>
    </div>
  )
}
