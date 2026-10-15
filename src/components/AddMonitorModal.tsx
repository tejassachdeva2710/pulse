'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Globe, Clock, ShieldCheck, Loader2 } from 'lucide-react'

interface AddMonitorModalProps {
  isOpen: boolean
  onClose: () => void
  onAdd: (data: { name: string; url: string; interval: number; method: string }) => Promise<void>
}

export function AddMonitorModal({ isOpen, onClose, onAdd }: AddMonitorModalProps) {
  const [name, setName] = useState('')
  const [url, setUrl] = useState('')
  const [interval, setInterval] = useState(60)
  const [method, setMethod] = useState('GET')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!name.trim()) {
      setError('Please provide a display name.')
      return
    }

    if (!url.trim() || !/^https?:\/\/.+/i.test(url.trim())) {
      setError('Please enter a valid URL starting with http:// or https://')
      return
    }

    try {
      setSubmitting(true)
      await onAdd({
        name: name.trim(),
        url: url.trim(),
        interval: Number(interval),
        method,
      })
      // Reset form
      setName('')
      setUrl('')
      setInterval(60)
      setMethod('GET')
      onClose()
    } catch (err: any) {
      setError(err.message || 'Failed to add monitor')
    } finally {
      setSubmitting(false)
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
            className="fixed inset-0 bg-black/70 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="relative z-10 w-full max-w-md rounded-2xl border border-[#2979ff]/30 bg-[#12121a] p-6 shadow-[0_0_50px_rgba(41,121,255,0.15)]"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-white/[0.06]">
              <div>
                <h3 className="text-xl font-bold text-white tracking-tight">Add New Monitor</h3>
                <p className="text-xs text-[#666680] mt-0.5">Configure continuous HTTP heartbeat monitoring</p>
              </div>
              <button
                onClick={onClose}
                type="button"
                className="flex h-8 w-8 items-center justify-center rounded-lg text-[#666680] transition-colors hover:bg-white/5 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            {error && (
              <div className="mt-4 rounded-lg border border-[#ff1744]/30 bg-[#ff1744]/10 p-3 text-xs text-[#ff5252]">
                {error}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#8e8ea0] mb-1.5">
                  Display Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Production API"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-[#0a0a0f] px-4 py-2.5 text-sm text-white placeholder-[#454558] outline-none transition-all focus:border-[#2979ff] focus:ring-1 focus:ring-[#2979ff]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#8e8ea0] mb-1.5">
                  Endpoint URL
                </label>
                <div className="relative">
                  <input
                    type="url"
                    placeholder="https://api.example.com/health"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-[#0a0a0f] pl-4 pr-10 py-2.5 text-sm text-white placeholder-[#454558] outline-none transition-all focus:border-[#2979ff] focus:ring-1 focus:ring-[#2979ff]"
                    required
                  />
                  <Globe className="absolute right-3.5 top-3 text-[#666680]" size={16} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#8e8ea0] mb-1.5">
                    Check Interval
                  </label>
                  <select
                    value={interval}
                    onChange={(e) => setInterval(Number(e.target.value))}
                    className="w-full rounded-xl border border-white/10 bg-[#0a0a0f] px-3 py-2.5 text-sm text-white outline-none transition-all focus:border-[#2979ff] focus:ring-1 focus:ring-[#2979ff]"
                  >
                    <option value={30}>Every 30 seconds</option>
                    <option value={60}>Every 1 minute</option>
                    <option value={300}>Every 5 minutes</option>
                    <option value={600}>Every 10 minutes</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#8e8ea0] mb-1.5">
                    HTTP Method
                  </label>
                  <select
                    value={method}
                    onChange={(e) => setMethod(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-[#0a0a0f] px-3 py-2.5 text-sm text-white outline-none transition-all focus:border-[#2979ff] focus:ring-1 focus:ring-[#2979ff]"
                  >
                    <option value="GET">GET</option>
                    <option value="HEAD">HEAD</option>
                    <option value="POST">POST</option>
                  </select>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-xl border border-white/10 px-4 py-2 text-xs font-medium text-[#8e8ea0] transition-colors hover:bg-white/5 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#2979ff] to-[#1565c0] px-5 py-2 text-xs font-semibold text-white shadow-[0_0_20px_rgba(41,121,255,0.3)] transition-all hover:shadow-[0_0_28px_rgba(41,121,255,0.5)] active:scale-95 disabled:opacity-50"
                >
                  {submitting && <Loader2 className="animate-spin" size={14} />}
                  <span>{submitting ? 'Testing & Saving...' : 'Add Monitor'}</span>
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
