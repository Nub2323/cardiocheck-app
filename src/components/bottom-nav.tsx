'use client'

import React from 'react'
import { MaterialIcon } from './icons'

interface NavItem {
  label: string
  icon: string
  active: boolean
  onClick: () => void
}

interface BottomNavProps {
  items: NavItem[]
}

export function BottomNav({ items }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex h-20 items-center justify-around border-t bg-white px-2"
      style={{ borderColor: '#E2E8F0' }}
    >
      {items.map((item) => (
        <button
          key={item.label}
          onClick={item.onClick}
          className="flex min-w-0 flex-col items-center gap-0.5 px-1 py-1 outline-none"
          style={{ touchAction: 'manipulation' }}
        >
          <MaterialIcon
            name={item.icon}
            size={22}
            className={item.active ? 'text-[#00288e]' : 'text-[#94A3B8]'}
          />
          <span
            className={`text-[10px] font-semibold leading-tight ${
              item.active ? 'text-[#00288e]' : 'text-[#94A3B8]'
            }`}
          >
            {item.label}
          </span>
        </button>
      ))}
    </nav>
  )
}
