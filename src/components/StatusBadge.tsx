'use client'

import React from 'react'

interface StatusBadgeProps {
  status: 'up' | 'down' | 'unknown' | string
  size?: 'sm' | 'md'
}

export function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const isUp = status === 'up'
  const isDown = status === 'down'

  const label = isUp ? 'Operational' : isDown ? 'Down' : 'Checking'

  const badgeStyles = isUp
    ? 'bg-[#00e676]/10 text-[#00e676] border-[#00e676]/25'
    : isDown
    ? 'bg-[#ff1744]/10 text-[#ff1744] border-[#ff1744]/25'
    : 'bg-[#666680]/15 text-[#a0a0b8] border-[#666680]/25'

  const dotStyles = isUp
    ? 'bg-[#00e676] pulse-green'
    : isDown
    ? 'bg-[#ff1744] pulse-red'
    : 'bg-[#666680]'

  return (
    <div
      className={`inline-flex items-center gap-2 rounded-full border font-medium ${badgeStyles} ${
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-xs'
      }`}
    >
      <span className={`h-2 w-2 rounded-full shrink-0 ${dotStyles}`} />
      <span>{label}</span>
    </div>
  )
}
