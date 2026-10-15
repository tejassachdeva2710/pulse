import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    let settings = await prisma.notificationSettings.findUnique({
      where: { id: 'default' },
    })

    if (!settings) {
      settings = await prisma.notificationSettings.create({
        data: {
          id: 'default',
          email: 'tejassachdevaa@gmail.com',
          notifyOnDown: true,
          notifyOnUp: true,
        },
      })
    }

    // Mask password before returning
    const safeSettings = {
      ...settings,
      smtpPass: settings.smtpPass ? '••••••••' : '',
      resendApiKey: settings.resendApiKey ? '••••••••' : '',
    }

    return Response.json({ settings: safeSettings })
  } catch (error: any) {
    return Response.json({ error: error.message || 'Failed to fetch settings' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      email,
      smtpHost,
      smtpPort,
      smtpUser,
      smtpPass,
      smtpSecure,
      resendApiKey,
      discordWebhook,
      notifyOnDown,
      notifyOnUp,
    } = body

    const existing = await prisma.notificationSettings.findUnique({
      where: { id: 'default' },
    })

    const dataToUpdate: any = {
      email: email?.trim() || null,
      smtpHost: smtpHost?.trim() || null,
      smtpPort: smtpPort ? Number(smtpPort) : 587,
      smtpUser: smtpUser?.trim() || null,
      smtpSecure: Boolean(smtpSecure),
      discordWebhook: discordWebhook?.trim() || null,
      notifyOnDown: notifyOnDown !== undefined ? Boolean(notifyOnDown) : true,
      notifyOnUp: notifyOnUp !== undefined ? Boolean(notifyOnUp) : true,
    }

    // Only update sensitive fields if not masked
    if (smtpPass && smtpPass !== '••••••••') {
      dataToUpdate.smtpPass = smtpPass.trim()
    }
    if (resendApiKey && resendApiKey !== '••••••••') {
      dataToUpdate.resendApiKey = resendApiKey.trim()
    }

    const updated = await prisma.notificationSettings.upsert({
      where: { id: 'default' },
      update: dataToUpdate,
      create: {
        id: 'default',
        ...dataToUpdate,
      },
    })

    return Response.json({ success: true, settings: updated })
  } catch (error: any) {
    return Response.json({ error: error.message || 'Failed to update settings' }, { status: 500 })
  }
}
