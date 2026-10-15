import { pingAllMonitors } from '@/lib/ping'

export async function POST() {
  try {
    const results = await pingAllMonitors()
    return Response.json({ success: true, count: results.length, results })
  } catch (error: any) {
    return Response.json({ error: error.message || 'Ping failed' }, { status: 500 })
  }
}
