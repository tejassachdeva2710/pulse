import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { pingMonitor } from '@/lib/ping'

export async function GET() {
  try {
    const monitors = await prisma.monitor.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        heartbeats: {
          orderBy: { createdAt: 'desc' },
          take: 500, // retrieve recent heartbeats for stat computations
        },
      },
    })

    const now = new Date()
    const nowTime = now.getTime()
    const oneDayAgo = new Date(nowTime - 24 * 60 * 60 * 1000)
    const sevenDaysAgo = new Date(nowTime - 7 * 24 * 60 * 60 * 1000)
    const thirtyDaysAgo = new Date(nowTime - 30 * 24 * 60 * 60 * 1000)
    const ninetyDaysAgo = new Date(nowTime - 90 * 24 * 60 * 60 * 1000)

    const monitorsWithStats = monitors.map((monitor) => {
      const beats = monitor.heartbeats
      const latestHeartbeat = beats[0] || null

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

      // Sparkline: last 20 heartbeats reversed to be chronological (oldest to newest)
      const recent20 = beats.slice(0, 20).reverse().map((b) => ({
        id: b.id,
        responseTime: b.responseTime,
        status: b.status,
        createdAt: b.createdAt.toISOString(),
      }))

      // 90-day daily uptime bar
      // 90 items ending today
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
          dailyUptime.push({
            date: dateStr,
            uptime: -1, // -1 denotes no data
          })
        } else {
          const upCount = dayBeats.filter((b) => b.status === 'up').length
          dailyUptime.push({
            date: dateStr,
            uptime: Number(((upCount / dayBeats.length) * 100).toFixed(1)),
          })
        }
      }

      return {
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
      }
    })

    return Response.json({ monitors: monitorsWithStats })
  } catch (error: any) {
    return Response.json({ error: error.message || 'Failed to fetch monitors' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, url, interval = 60, method = 'GET' } = body

    if (!name || !name.trim()) {
      return Response.json({ error: 'Name is required' }, { status: 400 })
    }

    if (!url || !url.trim() || !/^https?:\/\/.+/i.test(url.trim())) {
      return Response.json({ error: 'Valid URL starting with http:// or https:// is required' }, { status: 400 })
    }

    const trimmedUrl = url.trim()
    const trimmedName = name.trim()

    const monitor = await prisma.monitor.create({
      data: {
        name: trimmedName,
        url: trimmedUrl,
        interval: Number(interval) || 60,
        method: method || 'GET',
        status: 'unknown',
      },
    })

    // Immediately execute first ping asynchronously so status populates
    try {
      const pingRes = await pingMonitor({
        id: monitor.id,
        url: monitor.url,
        method: monitor.method,
      })

      await prisma.heartbeat.create({
        data: {
          monitorId: monitor.id,
          status: pingRes.status,
          responseTime: pingRes.responseTime,
          statusCode: pingRes.statusCode,
          message: pingRes.message,
        },
      })

      const updated = await prisma.monitor.update({
        where: { id: monitor.id },
        data: {
          status: pingRes.status,
        },
      })

      return Response.json({ monitor: updated }, { status: 201 })
    } catch {
      return Response.json({ monitor }, { status: 201 })
    }
  } catch (error: any) {
    return Response.json({ error: error.message || 'Failed to create monitor' }, { status: 500 })
  }
}
