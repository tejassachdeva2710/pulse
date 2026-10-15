'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  Mail,
  Bell,
  Send,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Key,
  Server,
  Loader2,
  ExternalLink,
} from 'lucide-react'

interface NotificationSettingsModalProps {
  isOpen: boolean
  onClose: () => void
  onSaved?: () => void
}

export function NotificationSettingsModal({
  isOpen,
  onClose,
  onSaved,
}: NotificationSettingsModalProps) {
  const [email, setEmail] = useState('tejassachdevaa@gmail.com')
  const [provider, setProvider] = useState<'gmail' | 'smtp' | 'resend'>('gmail')
  const [smtpUser, setSmtpUser] = useState('')
  const [smtpPass, setSmtpPass] = useState('')
  const [smtpHost, setSmtpHost] = useState('smtp.gmail.com')
  const [smtpPort, setSmtpPort] = useState(465)
  const [smtpSecure, setSmtpSecure] = useState(true)
  const [resendApiKey, setResendApiKey] = useState('')
  const [discordWebhook, setDiscordWebhook] = useState('')

  const [loading, setLoading] = useState(false)
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState<{
    emailSuccess?: boolean
    emailError?: string
    discordSuccess?: boolean
    discordError?: string
  } | null>(null)
  const [saveSuccess, setSaveSuccess] = useState(false)

  // Fetch current settings on open
  useEffect(() => {
    if (isOpen) {
      setTestResult(null)
      setSaveSuccess(false)
      fetch('/api/settings')
        .then((res) => res.json())
        .then((data) => {
          if (data.settings) {
            const s = data.settings
            if (s.email) setEmail(s.email)
            if (s.smtpUser) setSmtpUser(s.smtpUser)
            if (s.smtpHost) {
              setSmtpHost(s.smtpHost)
              if (s.smtpHost === 'smtp.gmail.com') setProvider('gmail')
              else setProvider('smtp')
            }
            if (s.smtpPort) setSmtpPort(s.smtpPort)
            if (s.smtpSecure !== undefined) setSmtpSecure(s.smtpSecure)
            if (s.resendApiKey) {
              setResendApiKey(s.resendApiKey)
              setProvider('resend')
            }
            if (s.discordWebhook) setDiscordWebhook(s.discordWebhook)
          }
        })
        .catch(console.error)
    }
  }, [isOpen])

  // Adjust defaults when switching provider
  const handleProviderChange = (p: 'gmail' | 'smtp' | 'resend') => {
    setProvider(p)
    if (p === 'gmail') {
      setSmtpHost('smtp.gmail.com')
      setSmtpPort(465)
      setSmtpSecure(true)
    } else if (p === 'smtp') {
      if (smtpHost === 'smtp.gmail.com') setSmtpHost('smtp.example.com')
      setSmtpPort(587)
      setSmtpSecure(false)
    }
  }

  const handleTest = async () => {
    setTesting(true)
    setTestResult(null)

    const payload: any = {
      email,
      discordWebhook,
    }

    if (provider === 'gmail') {
      payload.smtpHost = 'smtp.gmail.com'
      payload.smtpPort = 465
      payload.smtpSecure = true
      payload.smtpUser = smtpUser || email
      payload.smtpPass = smtpPass
    } else if (provider === 'smtp') {
      payload.smtpHost = smtpHost
      payload.smtpPort = Number(smtpPort)
      payload.smtpSecure = smtpSecure
      payload.smtpUser = smtpUser
      payload.smtpPass = smtpPass
    } else if (provider === 'resend') {
      payload.resendApiKey = resendApiKey
    }

    try {
      const res = await fetch('/api/settings/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()

      setTestResult({
        emailSuccess: data.email?.success,
        emailError: data.email?.error,
        discordSuccess: data.discord?.success,
        discordError: data.discord?.error,
      })
    } catch (err: any) {
      setTestResult({
        emailSuccess: false,
        emailError: err.message || 'Test dispatch network error',
      })
    } finally {
      setTesting(false)
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setSaveSuccess(false)

    const payload: any = {
      email,
      discordWebhook,
    }

    if (provider === 'gmail') {
      payload.smtpHost = 'smtp.gmail.com'
      payload.smtpPort = 465
      payload.smtpSecure = true
      payload.smtpUser = smtpUser || email
      payload.smtpPass = smtpPass
    } else if (provider === 'smtp') {
      payload.smtpHost = smtpHost
      payload.smtpPort = Number(smtpPort)
      payload.smtpSecure = smtpSecure
      payload.smtpUser = smtpUser
      payload.smtpPass = smtpPass
    } else if (provider === 'resend') {
      payload.resendApiKey = resendApiKey
    }

    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (res.ok) {
        setSaveSuccess(true)
        localStorage.setItem('pulse_alerts_configured', 'true')
        if (onSaved) onSaved()
        setTimeout(() => {
          onClose()
        }, 800)
      }
    } catch (err) {
      console.error('Failed to save settings', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/75 backdrop-blur-md"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="relative z-10 w-full max-w-lg rounded-2xl border border-[#2979ff]/40 bg-[#12121a] p-6 shadow-[0_0_60px_rgba(41,121,255,0.2)] max-h-[90vh] overflow-y-auto"
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-white/[0.08] pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#2979ff] to-[#00e676] text-white shadow-lg shadow-[#2979ff]/20">
                  <Bell size={20} />
                </div>
                <div>
                  <h3 className="text-xl font-bold tracking-tight text-white">
                    Alert & Notification Channels
                  </h3>
                  <p className="text-xs text-[#8e8ea0] mt-0.5">
                    Receive instant alerts when any endpoint degrades or recovers
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-[#666680] hover:bg-white/5 hover:text-white transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSave} className="mt-5 space-y-5">
              {/* Recipient Email */}
              <div>
                <label className="block text-xs font-semibold text-white mb-1.5 flex items-center gap-1.5">
                  <Mail size={14} className="text-[#2979ff]" />
                  Alert Recipient Email (Where to notify)
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tejassachdevaa@gmail.com"
                  className="w-full rounded-xl border border-white/10 bg-[#0a0a0f] px-4 py-2.5 text-sm text-white placeholder-[#454558] outline-none transition-all focus:border-[#2979ff] focus:ring-1 focus:ring-[#2979ff]"
                  required
                />
              </div>

              {/* Provider Selector Tabs */}
              <div>
                <label className="block text-xs font-semibold text-white mb-2">
                  Email Dispatch Method
                </label>
                <div className="grid grid-cols-3 gap-2 rounded-xl bg-[#0a0a0f] p-1 border border-white/[0.06]">
                  <button
                    type="button"
                    onClick={() => handleProviderChange('gmail')}
                    className={`rounded-lg py-2 text-xs font-semibold transition-all ${
                      provider === 'gmail'
                        ? 'bg-[#2979ff] text-white shadow-md'
                        : 'text-[#8e8ea0] hover:text-white'
                    }`}
                  >
                    Gmail SMTP
                  </button>
                  <button
                    type="button"
                    onClick={() => handleProviderChange('resend')}
                    className={`rounded-lg py-2 text-xs font-semibold transition-all ${
                      provider === 'resend'
                        ? 'bg-[#2979ff] text-white shadow-md'
                        : 'text-[#8e8ea0] hover:text-white'
                    }`}
                  >
                    Resend API
                  </button>
                  <button
                    type="button"
                    onClick={() => handleProviderChange('smtp')}
                    className={`rounded-lg py-2 text-xs font-semibold transition-all ${
                      provider === 'smtp'
                        ? 'bg-[#2979ff] text-white shadow-md'
                        : 'text-[#8e8ea0] hover:text-white'
                    }`}
                  >
                    Custom SMTP
                  </button>
                </div>
              </div>

              {/* Gmail Mode */}
              {provider === 'gmail' && (
                <div className="rounded-xl border border-white/[0.06] bg-[#0a0a0f]/60 p-4 space-y-3">
                  <div className="flex items-start gap-2 text-[11px] text-[#8e8ea0] bg-white/[0.03] p-2.5 rounded-lg border border-white/[0.04]">
                    <HelpCircle size={15} className="text-[#2979ff] shrink-0 mt-0.5" />
                    <span>
                      To send via Gmail, Google requires a 16-letter{' '}
                      <strong>App Password</strong> (generate in Google Account &gt; Security &gt; 2-Step Verification &gt; App Passwords).
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#8e8ea0] mb-1">
                      Sender Gmail Address
                    </label>
                    <input
                      type="email"
                      value={smtpUser}
                      onChange={(e) => setSmtpUser(e.target.value)}
                      placeholder="your.email@gmail.com"
                      className="w-full rounded-xl border border-white/10 bg-[#0a0a0f] px-3.5 py-2 text-xs text-white placeholder-[#454558] outline-none focus:border-[#2979ff]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#8e8ea0] mb-1">
                      16-Letter Google App Password
                    </label>
                    <input
                      type="password"
                      value={smtpPass}
                      onChange={(e) => setSmtpPass(e.target.value)}
                      placeholder="abcd efgh ijkl mnop"
                      className="w-full rounded-xl border border-white/10 bg-[#0a0a0f] px-3.5 py-2 text-xs text-white placeholder-[#454558] outline-none focus:border-[#2979ff]"
                    />
                  </div>
                </div>
              )}

              {/* Resend Mode */}
              {provider === 'resend' && (
                <div className="rounded-xl border border-white/[0.06] bg-[#0a0a0f]/60 p-4 space-y-3">
                  <div className="flex items-start gap-2 text-[11px] text-[#8e8ea0] bg-white/[0.03] p-2.5 rounded-lg border border-white/[0.04]">
                    <HelpCircle size={15} className="text-[#00e676] shrink-0 mt-0.5" />
                    <span>
                      Get a free API key at{' '}
                      <a
                        href="https://resend.com"
                        target="_blank"
                        rel="noreferrer"
                        className="text-[#2979ff] underline inline-flex items-center gap-0.5"
                      >
                        resend.com <ExternalLink size={10} />
                      </a>{' '}
                      (100 emails/day free, zero SMTP port blocking).
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#8e8ea0] mb-1">
                      Resend API Key
                    </label>
                    <input
                      type="password"
                      value={resendApiKey}
                      onChange={(e) => setResendApiKey(e.target.value)}
                      placeholder="re_123456789..."
                      className="w-full rounded-xl border border-white/10 bg-[#0a0a0f] px-3.5 py-2 text-xs text-white placeholder-[#454558] outline-none focus:border-[#2979ff]"
                    />
                  </div>
                </div>
              )}

              {/* Custom SMTP Mode */}
              {provider === 'smtp' && (
                <div className="rounded-xl border border-white/[0.06] bg-[#0a0a0f]/60 p-4 space-y-3">
                  <div className="grid grid-cols-3 gap-2">
                    <div className="col-span-2">
                      <label className="block text-[11px] font-medium text-[#8e8ea0] mb-1">
                        SMTP Host
                      </label>
                      <input
                        type="text"
                        value={smtpHost}
                        onChange={(e) => setSmtpHost(e.target.value)}
                        placeholder="smtp.mailgun.org"
                        className="w-full rounded-lg border border-white/10 bg-[#0a0a0f] px-3 py-1.5 text-xs text-white outline-none focus:border-[#2979ff]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-[#8e8ea0] mb-1">
                        Port
                      </label>
                      <input
                        type="number"
                        value={smtpPort}
                        onChange={(e) => setSmtpPort(Number(e.target.value))}
                        className="w-full rounded-lg border border-white/10 bg-[#0a0a0f] px-3 py-1.5 text-xs text-white outline-none focus:border-[#2979ff]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-medium text-[#8e8ea0] mb-1">
                        SMTP Username
                      </label>
                      <input
                        type="text"
                        value={smtpUser}
                        onChange={(e) => setSmtpUser(e.target.value)}
                        className="w-full rounded-lg border border-white/10 bg-[#0a0a0f] px-3 py-1.5 text-xs text-white outline-none focus:border-[#2979ff]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-[#8e8ea0] mb-1">
                        SMTP Password
                      </label>
                      <input
                        type="password"
                        value={smtpPass}
                        onChange={(e) => setSmtpPass(e.target.value)}
                        className="w-full rounded-lg border border-white/10 bg-[#0a0a0f] px-3 py-1.5 text-xs text-white outline-none focus:border-[#2979ff]"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Discord Webhook Section */}
              <div>
                <label className="block text-xs font-semibold text-white mb-1.5 flex items-center gap-1.5">
                  <Server size={14} className="text-[#00e676]" />
                  Discord Channel Webhook URL (Optional)
                </label>
                <input
                  type="url"
                  value={discordWebhook}
                  onChange={(e) => setDiscordWebhook(e.target.value)}
                  placeholder="https://discord.com/api/webhooks/..."
                  className="w-full rounded-xl border border-white/10 bg-[#0a0a0f] px-4 py-2.5 text-sm text-white placeholder-[#454558] outline-none transition-all focus:border-[#2979ff] focus:ring-1 focus:ring-[#2979ff]"
                />
                <p className="mt-1 text-[11px] text-[#666680]">
                  Get this from Discord Channel Settings &gt; Integrations &gt; Webhooks &gt; Copy Webhook URL.
                </p>
              </div>

              {/* Test Results Display */}
              {testResult && (
                <div className="rounded-xl border border-white/[0.08] bg-[#0a0a0f] p-3 text-xs space-y-1.5">
                  <div className="font-semibold text-white flex items-center justify-between">
                    <span>Test Notification Status</span>
                  </div>

                  {testResult.emailSuccess ? (
                    <div className="flex items-center gap-2 text-[#00e676]">
                      <CheckCircle2 size={14} className="shrink-0" />
                      <span>Email sent successfully! Check {email} now.</span>
                    </div>
                  ) : (
                    <div className="flex items-start gap-2 text-[#ff5252]">
                      <AlertCircle size={14} className="shrink-0 mt-0.5" />
                      <span>Email Failed: {testResult.emailError}</span>
                    </div>
                  )}

                  {discordWebhook && (
                    testResult.discordSuccess ? (
                      <div className="flex items-center gap-2 text-[#00e676]">
                        <CheckCircle2 size={14} className="shrink-0" />
                        <span>Discord webhook message delivered!</span>
                      </div>
                    ) : (
                      <div className="flex items-start gap-2 text-[#ff5252]">
                        <AlertCircle size={14} className="shrink-0 mt-0.5" />
                        <span>Discord Failed: {testResult.discordError}</span>
                      </div>
                    )
                  )}
                </div>
              )}

              {saveSuccess && (
                <div className="rounded-lg bg-[#00e676]/15 border border-[#00e676]/30 p-2.5 text-center text-xs font-semibold text-[#00e676]">
                  ✓ Notification settings saved!
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-between border-t border-white/[0.06] pt-4">
                <button
                  type="button"
                  onClick={handleTest}
                  disabled={testing}
                  className="flex items-center gap-2 rounded-xl border border-[#2979ff]/40 bg-[#2979ff]/10 px-4 py-2.5 text-xs font-semibold text-[#2979ff] transition-all hover:bg-[#2979ff]/20 active:scale-95 disabled:opacity-50"
                >
                  {testing ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                  <span>{testing ? 'Sending Test...' : 'Send Test Alert'}</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="rounded-xl border border-white/10 px-4 py-2.5 text-xs font-medium text-[#8e8ea0] hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#2979ff] to-[#1565c0] px-5 py-2.5 text-xs font-semibold text-white shadow-lg shadow-[#2979ff]/25 hover:shadow-[#2979ff]/40 active:scale-95 disabled:opacity-50"
                  >
                    {loading && <Loader2 size={14} className="animate-spin" />}
                    <span>Save Settings</span>
                  </button>
                </div>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
