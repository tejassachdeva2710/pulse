import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { searchParams } = new URL(request.url)
    const hoursParam = searchParams.get('hours')
    const hours = hoursParam ? Math.max(1, parseInt(hoursParam, 10)) : 24

    const since = new Date(Date.now() - hours * 60 * 60 * 1000)

    const heartbeats = await prisma.heartbeat.findMany({
      where: {
        monitorId: id,
        createdAt: { gte: since },
      },
      orderBy: { createdAt: 'desc' },
      take: 200,
    })

    const totalChecks = heartbeats.length
    let avgResponseTime = 0
    let uptime = 100

    if (totalChecks > 0) {
      const sumResponseTime = heartbeats.reduce((acc, h) => acc + h.responseTime, 0)
      avgResponseTime = Math.round(sumResponseTime / totalChecks)
      const upCount = heartbeats.filter((h) => h.status === 'up').length
      uptime = Number(((upCount / totalChecks) * 100).toFixed(2))
    }

    return Response.json({
      heartbeats: heartbeats.map((h) => ({
        id: h.id,
        status: h.status,
        responseTime: h.responseTime,
        statusCode: h.statusCode,
        message: h.message,
        createdAt: h.createdAt.toISOString(),
      })),
      stats: {
        avgResponseTime,
        uptime,
        totalChecks,
      },
    })
  } catch (error: any) {
    return Response.json({ error: error.message || 'Failed to fetch heartbeats' }, { status: 500 })
  }
}
