import { NextRequest } from 'next/server'
import { sendEmailAlert, sendDiscordAlert } from '@/lib/notifications'

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
    } = body

    const targetEmail = email?.trim() || 'tejassachdevaa@gmail.com'

    const emailResult = await sendEmailAlert(
      {
        type: 'test',
        monitorName: 'Pulse Production Node',
        url: 'https://pulse.internal/health',
        statusCode: 200,
        responseTime: 42,
      },
      targetEmail,
      {
        smtpHost,
        smtpPort,
        smtpUser,
        smtpPass,
        smtpSecure,
        resendApiKey,
      }
    )

    let discordResult: { success: boolean; error?: string } = { success: false, error: 'No Discord webhook provided' }
    if (discordWebhook && discordWebhook.trim()) {
      discordResult = await sendDiscordAlert(
        {
          type: 'test',
          monitorName: 'Pulse Production Node',
          url: 'https://pulse.internal/health',
          statusCode: 200,
          responseTime: 42,
        },
        discordWebhook.trim()
      )
    }

    return Response.json({
      email: emailResult,
      discord: discordResult,
    })
  } catch (error: any) {
    return Response.json({ error: error.message || 'Test dispatch failed' }, { status: 500 })
  }
}
