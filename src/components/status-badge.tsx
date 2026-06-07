'use client'

import React from 'react'
import type { AnswerSeverity } from '@/lib/app-state'

const severityStyles: Record<AnswerSeverity, { bg: string; border: string; text: string; label: string }> = {
  green: { bg: '#DCFCE7', border: '#16A34A', text: '#14532D', label: 'Normal' },
  neutral: { bg: '#F1F5F9', border: '#94A3B8', text: '#334155', label: 'Estable' },
  'yellow-low': { bg: '#FEF9C3', border: '#CA8A04', text: '#713F12', label: 'Precaución' },
  yellow: { bg: '#FEF3C7', border: '#D97706', text: '#78350F', label: 'Atención' },
  'yellow-high': { bg: '#FEF3C7', border: '#D97706', text: '#78350F', label: 'Alerta' },
  red: { bg: '#FEE2E2', border: '#DC2626', text: '#7F1D1D', label: 'Urgente' },
}

interface StatusBadgeProps {
  severity: AnswerSeverity
  showLabel?: boolean
  className?: string
}

export function StatusBadge({ severity, showLabel = true, className = '' }: StatusBadgeProps) {
  const style = severityStyles[severity]
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-bold ${className}`}
      style={{
        backgroundColor: style.bg,
        borderColor: style.border,
        color: style.text,
      }}
    >
      <span
        className="h-2 w-2 rounded-full"
        style={{ backgroundColor: style.border }}
      />
      {showLabel && style.label}
    </span>
  )
}

export function getSeverityStyles(severity: AnswerSeverity) {
  return severityStyles[severity]
}
