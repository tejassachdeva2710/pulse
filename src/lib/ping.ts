import { prisma } from './db'
import { sendEmailAlert, sendDiscordAlert } from './notifications'

export interface MonitorPingInput {
  id?: string
  url: string
  method?: string
}

export interface PingResult {
  status: 'up' | 'down'
  responseTime: number
  statusCode: number | null
  message: string | null
}

export async function pingMonitor(monitor: MonitorPingInput): Promise<PingResult> {
  const start = Date.now()
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 10000)

  try {
    const res = await fetch(monitor.url, {
      method: monitor.method || 'GET',
      signal: controller.signal,
      headers: {
        'User-Agent': 'Pulse Uptime Monitor/1.0',
        'Accept': '*/*',
      },
    })
    clearTimeout(timeoutId)
    const responseTime = Date.now() - start

    if (res.ok) {
      return {
        status: 'up',
        responseTime,
        statusCode: res.status,
        message: null,
      }
    } else {
      return {
        status: 'down',
        responseTime,
        statusCode: res.status,
        message: `HTTP ${res.status} ${res.statusText || 'Error'}`,
      }
    }
  } catch (error: any) {
    clearTimeout(timeoutId)
    const responseTime = Date.now() - start
    const isAbort = error.name === 'AbortError'
    return {
      status: 'down',
      responseTime,
      statusCode: null,
      message: isAbort ? 'Request timed out after 10000ms' : (error.message || 'Connection failed'),
    }
  }
}

export async function pingAllMonitors() {
  const monitors = await prisma.monitor.findMany()

  const results = await Promise.allSettled(
    monitors.map(async (m) => {
      const pingRes = await pingMonitor({
        id: m.id,
        url: m.url,
        method: m.method,
      })

      // Store heartbeat
      const heartbeat = await prisma.heartbeat.create({
        data: {
          monitorId: m.id,
          status: pingRes.status,
          responseTime: pingRes.responseTime,
          statusCode: pingRes.statusCode,
          message: pingRes.message,
        },
      })

      // Check for state transitions (UP -> DOWN or DOWN -> UP)
      const prevStatus = m.status
      const newStatus = pingRes.status

      if (prevStatus === 'up' && newStatus === 'down') {
        // Send alert asynchronously
        Promise.allSettled([
          sendEmailAlert({
            type: 'down',
            monitorName: m.name,
            url: m.url,
            statusCode: pingRes.statusCode,
            responseTime: pingRes.responseTime,
            error: pingRes.message,
          }),
          sendDiscordAlert({
            type: 'down',
            monitorName: m.name,
            url: m.url,
            statusCode: pingRes.statusCode,
            responseTime: pingRes.responseTime,
            error: pingRes.message,
          }),
        ]).catch(console.error)
      } else if (prevStatus === 'down' && newStatus === 'up') {
        // Send recovery notification
        Promise.allSettled([
          sendEmailAlert({
            type: 'recovery',
            monitorName: m.name,
            url: m.url,
            statusCode: pingRes.statusCode,
            responseTime: pingRes.responseTime,
          }),
          sendDiscordAlert({
            type: 'recovery',
            monitorName: m.name,
            url: m.url,
            statusCode: pingRes.statusCode,
            responseTime: pingRes.responseTime,
          }),
        ]).catch(console.error)
      }

      // Update monitor status and record previous status
      await prisma.monitor.update({
        where: { id: m.id },
        data: {
          status: newStatus,
          previousStatus: prevStatus,
          updatedAt: new Date(),
        },
      })

      return {
        monitorId: m.id,
        name: m.name,
        ...pingRes,
        heartbeatId: heartbeat.id,
      }
    })
  )

  return results.map((r, i) => {
    if (r.status === 'fulfilled') {
      return r.value
    } else {
      return {
        monitorId: monitors[i].id,
        name: monitors[i].name,
        status: 'down',
        responseTime: 0,
        statusCode: null,
        message: r.reason?.message || 'Ping execution failed',
      }
    }
  })
}
