import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const count = await prisma.monitor.count()
  if (count > 0) {
    console.log(`Database already has ${count} monitors. Skipping initial seed.`)
    return
  }

  console.log('Seeding initial monitors with baseline heartbeats...')

  const services = [
    {
      name: 'Google Services',
      url: 'https://www.google.com',
      interval: 60,
      baseLatency: 35,
    },
    {
      name: 'GitHub Core API',
      url: 'https://api.github.com',
      interval: 60,
      baseLatency: 92,
    },
    {
      name: 'Cloudflare Edge (1.1.1.1)',
      url: 'https://1.1.1.1',
      interval: 60,
      baseLatency: 18,
    },
  ]

  const now = Date.now()

  for (const s of services) {
    const monitor = await prisma.monitor.create({
      data: {
        name: s.name,
        url: s.url,
        interval: s.interval,
        method: 'GET',
        status: 'up',
      },
    })

    // Generate 40 baseline heartbeats spread over the past 24 hours
    const heartbeatsData = []
    for (let i = 40; i >= 0; i--) {
      const timeOffset = i * 25 * 60 * 1000 // every ~25 mins
      const jitter = Math.floor(Math.random() * 20) - 10
      const latency = Math.max(12, s.baseLatency + jitter)
      const isUp = Math.random() > 0.02 // 98% up

      heartbeatsData.push({
        monitorId: monitor.id,
        status: isUp ? 'up' : 'down',
        responseTime: isUp ? latency : 0,
        statusCode: isUp ? 200 : 503,
        message: isUp ? null : 'Temporary upstream timeout',
        createdAt: new Date(now - timeOffset),
      })
    }

    await prisma.heartbeat.createMany({
      data: heartbeatsData,
    })

    console.log(`Created monitor ${s.name} with ${heartbeatsData.length} heartbeats.`)
  }

  console.log('Seed completed successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
