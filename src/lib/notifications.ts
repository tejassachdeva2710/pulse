import nodemailer from 'nodemailer'
import { prisma } from './db'

export interface SendAlertParams {
  type: 'down' | 'recovery' | 'test'
  monitorName: string
  url?: string
  status?: string
  statusCode?: number | null
  responseTime?: number | null
  error?: string | null
}

export async function getNotificationSettings() {
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

  return settings
}

export async function sendEmailAlert(params: SendAlertParams, targetEmail?: string, customSmtp?: any) {
  const settings = await getNotificationSettings()
  const recipient = targetEmail || settings.email

  if (!recipient) {
    return { success: false, error: 'No recipient email configured' }
  }

  const isTest = params.type === 'test'
  const isDown = params.type === 'down'

  const subject = isTest
    ? '⚡ [Pulse Test] Email Alert System Verified'
    : isDown
    ? `🚨 [Pulse Alert] ${params.monitorName} is DOWN`
    : `✅ [Pulse Recovery] ${params.monitorName} is back UP`

  const htmlContent = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0a0a0f; color: #e0e0e0; padding: 32px 20px; border-radius: 12px; max-width: 580px; margin: 0 auto; border: 1px solid rgba(255,255,255,0.1);">
      <div style="margin-bottom: 24px; display: flex; align-items: center; gap: 12px;">
        <div style="width: 36px; height: 36px; border-radius: 8px; background: linear-gradient(135deg, #2979ff, #00e676); color: white; display: inline-flex; align-items: center; justify-content: center; font-weight: bold; font-size: 18px; text-align: center; line-height: 36px;">
          P
        </div>
        <span style="font-size: 20px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px; margin-left: 10px;">Pulse Infrastructure Alert</span>
      </div>

      <div style="background: #12121a; border-radius: 10px; padding: 24px; border: 1px solid ${isDown ? 'rgba(255,23,68,0.3)' : 'rgba(0,230,118,0.3)'}; margin-bottom: 24px;">
        <h2 style="margin: 0 0 12px 0; font-size: 18px; color: ${isDown ? '#ff1744' : '#00e676'};">
          ${isTest ? '⚡ Email Alerts Configured Successfully' : isDown ? 'Service Outage Detected' : 'Service Recovered'}
        </h2>
        <p style="margin: 0 0 16px 0; font-size: 14px; color: #a0a0b8; line-height: 1.5;">
          ${
            isTest
              ? 'This is a test notification confirming that Pulse can reach your inbox at <strong>' + recipient + '</strong>.'
              : `Service <strong>${params.monitorName}</strong> (${params.url || ''}) ${isDown ? 'failed its heartbeat check.' : 'has resumed operational status.'}`
          }
        </p>

        <table style="width: 100%; border-collapse: collapse; font-size: 13px; color: #c0c0d0;">
          ${params.url ? `<tr><td style="padding: 6px 0; color: #666680;">Endpoint:</td><td style="padding: 6px 0; font-family: monospace; color: #2979ff;">${params.url}</td></tr>` : ''}
          ${params.statusCode ? `<tr><td style="padding: 6px 0; color: #666680;">Status Code:</td><td style="padding: 6px 0; font-weight: bold;">${params.statusCode}</td></tr>` : ''}
          ${params.responseTime ? `<tr><td style="padding: 6px 0; color: #666680;">Response Time:</td><td style="padding: 6px 0;">${params.responseTime} ms</td></tr>` : ''}
          ${params.error ? `<tr><td style="padding: 6px 0; color: #666680;">Error Details:</td><td style="padding: 6px 0; color: #ff5252;">${params.error}</td></tr>` : ''}
          <tr><td style="padding: 6px 0; color: #666680;">Timestamp:</td><td style="padding: 6px 0;">${new Date().toUTCString()}</td></tr>
        </table>
      </div>

      <div style="font-size: 12px; color: #666680; text-align: center;">
        Sent automatically by your self-hosted Pulse instance.
      </div>
    </div>
  `

  // Check Resend API first
  const resendKey = customSmtp?.resendApiKey || settings.resendApiKey || process.env.RESEND_API_KEY
  if (resendKey) {
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'Pulse Alerts <onboarding@resend.dev>',
          to: recipient,
          subject,
          html: htmlContent,
        }),
      })

      const data = await res.json()
      if (res.ok) {
        return { success: true, id: data.id, method: 'Resend' }
      } else {
        return { success: false, error: data.message || 'Resend API failed' }
      }
    } catch (err: any) {
      return { success: false, error: err.message }
    }
  }

  // Check SMTP / Gmail App Password
  const smtpHost = customSmtp?.smtpHost || settings.smtpHost || (settings.smtpUser?.includes('@gmail.com') ? 'smtp.gmail.com' : null)
  const smtpUser = customSmtp?.smtpUser || settings.smtpUser
  const smtpPass = customSmtp?.smtpPass || settings.smtpPass
  const smtpPort = customSmtp?.smtpPort || settings.smtpPort || 587
  const smtpSecure = customSmtp?.smtpSecure !== undefined ? customSmtp.smtpSecure : (settings.smtpSecure || smtpPort === 465)

  if (smtpHost && smtpUser && smtpPass) {
    try {
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: Number(smtpPort),
        secure: smtpSecure,
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
        tls: {
          rejectUnauthorized: false,
        },
      })

      const info = await transporter.sendMail({
        from: `"Pulse Alerts" <${smtpUser}>`,
        to: recipient,
        subject,
        html: htmlContent,
      })

      return { success: true, messageId: info.messageId, method: 'SMTP' }
    } catch (err: any) {
      return { success: false, error: `SMTP Delivery Failed: ${err.message}` }
    }
  }

  // If no SMTP or Resend credentials provided yet
  return {
    success: false,
    error: 'No active email provider configured. Please provide a Gmail App Password, Custom SMTP, or Resend API Key in Settings to dispatch external emails.',
  }
}

export async function sendDiscordAlert(params: SendAlertParams, targetWebhook?: string) {
  const settings = await getNotificationSettings()
  const webhookUrl = targetWebhook || settings.discordWebhook

  if (!webhookUrl || !webhookUrl.startsWith('https://discord.com/api/webhooks/')) {
    return { success: false, error: 'No valid Discord webhook configured' }
  }

  const isTest = params.type === 'test'
  const isDown = params.type === 'down'

  const color = isTest ? 0x2979ff : isDown ? 0xff1744 : 0x00e676
  const title = isTest
    ? '⚡ Pulse Test Notification'
    : isDown
    ? `🚨 Outage Alert: ${params.monitorName}`
    : `✅ Recovery Alert: ${params.monitorName}`

  const description = isTest
    ? 'Your Discord webhook notification channel has been connected and verified successfully.'
    : isDown
    ? `Service **${params.monitorName}** failed to respond to the health check.`
    : `Service **${params.monitorName}** is back up and responding normally.`

  const fields = []
  if (params.url) fields.push({ name: 'URL', value: params.url, inline: false })
  if (params.statusCode) fields.push({ name: 'HTTP Status', value: `${params.statusCode}`, inline: true })
  if (params.responseTime) fields.push({ name: 'Latency', value: `${params.responseTime}ms`, inline: true })
  if (params.error) fields.push({ name: 'Error', value: `${params.error}`, inline: false })

  try {
    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'Pulse Uptime',
        avatar_url: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png',
        embeds: [
          {
            title,
            description,
            color,
            fields,
            footer: {
              text: 'Pulse Infrastructure Monitor',
            },
            timestamp: new Date().toISOString(),
          },
        ],
      }),
    })

    if (res.ok || res.status === 204) {
      return { success: true }
    } else {
      const txt = await res.text()
      return { success: false, error: `Discord API returned ${res.status}: ${txt}` }
    }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}
