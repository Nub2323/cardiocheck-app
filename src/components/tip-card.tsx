'use client'

import React from 'react'
import { MaterialIcon } from './icons'

interface TipCardProps {
  title: string
  text: string
  icon?: string
}

export function TipCard({ title, text, icon = 'lightbulb' }: TipCardProps) {
  return (
    <div
      className="rounded-2xl border p-4"
      style={{
        backgroundColor: '#F0FDF4',
        borderColor: '#BBF7D0',
      }}
    >
      <div className="mb-2 flex items-center gap-2">
        <MaterialIcon name={icon} size={18} className="text-[#166534]" />
        <span className="text-sm font-bold text-[#166534]">{title}</span>
      </div>
      <p className="text-[13px] leading-relaxed text-[#166534]/80">{text}</p>
    </div>
  )
}
