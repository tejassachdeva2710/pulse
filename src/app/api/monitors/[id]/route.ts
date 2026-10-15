import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const monitor = await prisma.monitor.findUnique({
      where: { id },
      include: {
        heartbeats: {
          orderBy: { createdAt: 'desc' },
          take: 500,
        },
      },
    })

    if (!monitor) {
      return Response.json({ error: 'Monitor not found' }, { status: 404 })
    }

    const beats = monitor.heartbeats
    const latestHeartbeat = beats[0] || null

    const now = new Date()
    const nowTime = now.getTime()
    const oneDayAgo = new Date(nowTime - 24 * 60 * 60 * 1000)
    const sevenDaysAgo = new Date(nowTime - 7 * 24 * 60 * 60 * 1000)
    const thirtyDaysAgo = new Date(nowTime - 30 * 24 * 60 * 60 * 1000)
    const ninetyDaysAgo = new Date(nowTime - 90 * 24 * 60 * 60 * 1000)

    const calcUptime = (since: Date) => {
      const periodBeats = beats.filter((b) => b.createdAt >= since)
      if (periodBeats.length === 0) return 100
      const upCount = periodBeats.filter((b) => b.status === 'up').length
      return Number(((upCount / periodBeats.length) * 100).toFixed(2))
    }

    const uptime24h = calcUptime(oneDayAgo)
    const uptime7d = calcUptime(sevenDaysAgo)
    const uptime30d = calcUptime(thirtyDaysAgo)
    const uptime90d = calcUptime(ninetyDaysAgo)

    const recent20 = beats.slice(0, 20).reverse().map((b) => ({
      id: b.id,
      responseTime: b.responseTime,
      status: b.status,
      statusCode: b.statusCode,
      message: b.message,
      createdAt: b.createdAt.toISOString(),
    }))

    // 90-day daily uptime
    const dailyUptime: { date: string; uptime: number }[] = []
    for (let i = 89; i >= 0; i--) {
      const dayStart = new Date(now)
      dayStart.setHours(0, 0, 0, 0)
      dayStart.setDate(dayStart.getDate() - i)

      const dayEnd = new Date(dayStart)
      dayEnd.setHours(23, 59, 59, 999)

      const dayBeats = beats.filter(
        (b) => b.createdAt >= dayStart && b.createdAt <= dayEnd
      )

      const dateStr = dayStart.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      })

      if (dayBeats.length === 0) {
        dailyUptime.push({ date: dateStr, uptime: -1 })
      } else {
        const upCount = dayBeats.filter((b) => b.status === 'up').length
        dailyUptime.push({
          date: dateStr,
          uptime: Number(((upCount / dayBeats.length) * 100).toFixed(1)),
        })
      }
    }

    return Response.json({
      monitor: {
        id: monitor.id,
        name: monitor.name,
        url: monitor.url,
        interval: monitor.interval,
        method: monitor.method,
        status: monitor.status,
        createdAt: monitor.createdAt.toISOString(),
        updatedAt: monitor.updatedAt.toISOString(),
        lastChecked: latestHeartbeat ? latestHeartbeat.createdAt.toISOString() : null,
        lastResponseTime: latestHeartbeat ? latestHeartbeat.responseTime : null,
        lastStatusCode: latestHeartbeat ? latestHeartbeat.statusCode : null,
        lastMessage: latestHeartbeat ? latestHeartbeat.message : null,
        uptime24h,
        uptime7d,
        uptime30d,
        uptime90d,
        recentHeartbeats: recent20,
        dailyUptime,
      },
    })
  } catch (error: any) {
    return Response.json({ error: error.message || 'Failed to fetch monitor' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await prisma.monitor.delete({
      where: { id },
    })

    return Response.json({ success: true, id })
  } catch (error: any) {
    return Response.json({ error: error.message || 'Failed to delete monitor' }, { status: 500 })
  }
}
