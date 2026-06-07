'use client'

import React, { useState } from 'react'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { MaterialIcon } from '@/components/icons'
import { es } from 'date-fns/locale'

interface DatePickerProps {
  value: string // YYYY-MM-DD format
  onChange: (date: string) => void
  placeholder?: string
  error?: boolean
  disabled?: boolean
  maxDate?: Date
  label?: string
}

export function DatePicker({
  value,
  onChange,
  placeholder = 'Seleccionar fecha',
  error = false,
  disabled = false,
  maxDate,
  label,
}: DatePickerProps) {
  const [open, setOpen] = useState(false)

  const selectedDate = value ? new Date(value + 'T12:00:00') : undefined

  const handleSelect = (date: Date | undefined) => {
    if (date) {
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      onChange(`${year}-${month}-${day}`)
      setOpen(false)
    }
  }

  const formatDisplayDate = (dateStr: string): string => {
    if (!dateStr) return placeholder
    const [y, m, d] = dateStr.split('-')
    return `${d}/${m}/${y}`
  }

  return (
    <div>
      {label && (
        <label className="mb-2 block text-[11px] font-bold tracking-wide text-[#475569]">
          {label}
        </label>
      )}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            disabled={disabled}
            className="flex w-full items-center justify-between rounded-xl border bg-[#F8FAFC] px-4 py-3 text-sm transition-colors focus:border-[#00288e] focus:outline-none focus:ring-2 focus:ring-[#00288e]/20 disabled:opacity-50"
            style={{
              minHeight: 48,
              borderColor: error ? '#DC2626' : '#E2E8F0',
              color: value ? '#0F172A' : '#94A3B8',
            }}
          >
            <span className="flex items-center gap-2">
              <MaterialIcon name="calendar_today" size={18} className="text-[#94A3B8]" />
              {formatDisplayDate(value)}
            </span>
            <MaterialIcon name="expand_more" size={20} className="text-[#94A3B8]" />
          </button>
        </PopoverTrigger>
        <PopoverContent
          className="w-auto rounded-2xl border-[#E2E8F0] p-0 shadow-lg"
          align="start"
          sideOffset={8}
        >
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={handleSelect}
            disabled={maxDate ? { after: maxDate } : undefined}
            defaultMonth={selectedDate ?? (maxDate ? new Date(maxDate.getFullYear() - 40, 0) : new Date(1980, 0))}
            captionLayout="dropdown"
            fromYear={1920}
            toYear={maxDate ? maxDate.getFullYear() : new Date().getFullYear()}
            locale={es}
            classNames={{
              root: 'p-3',
              months: 'flex gap-4 flex-col relative',
              month: 'flex flex-col w-full gap-2',
              nav: 'flex items-center gap-1 w-full absolute top-0 inset-x-0 justify-between px-1',
              month_caption: 'flex items-center justify-center h-10 w-full px-8',
              dropdowns: 'w-full flex items-center text-sm font-medium justify-center h-10 gap-1.5',
              dropdown_root: 'relative has-focus:border-ring border border-input shadow-xs has-focus:ring-ring/50 has-focus:ring-[3px] rounded-md',
              dropdown: 'absolute bg-popover inset-0 opacity-0',
              caption_label: 'select-none font-medium text-sm',
              day: 'relative w-full h-full p-0 text-center select-none',
              today: 'bg-[#EFF6FF] text-[#00288e] rounded-md font-bold',
            }}
            components={{
              Chevron: ({ orientation, ...props }) => {
                const iconName = orientation === 'left' ? 'chevron_left' : orientation === 'right' ? 'chevron_right' : 'expand_more'
                return <MaterialIcon name={iconName} size={16} className="text-[#475569]" />
              },
            }}
          />
          {/* Quick year buttons for birth dates */}
          <div className="border-t border-[#E2E8F0] px-3 pb-3 pt-2">
            <p className="mb-2 text-[10px] font-bold text-[#94A3B8]">ACCESO RÁPIDO</p>
            <div className="flex flex-wrap gap-1.5">
              {[1950, 1960, 1970, 1980, 1990, 2000].map((year) => (
                <button
                  key={year}
                  type="button"
                  onClick={() => {
                    const d = selectedDate ?? new Date(year, 0, 1)
                    const newDate = new Date(year, d.getMonth(), d.getDate())
                    if (maxDate && newDate > maxDate) return
                    handleSelect(newDate)
                  }}
                  className="rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-2.5 py-1 text-[11px] font-semibold text-[#475569] transition-all active:scale-95 hover:border-[#00288e] hover:text-[#00288e]"
                >
                  {year}s
                </button>
              ))}
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
