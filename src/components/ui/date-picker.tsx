'use client'

import React, { useMemo } from 'react'

interface DatePickerProps {
  value: string // YYYY-MM-DD format
  onChange: (date: string) => void
  placeholder?: string
  error?: boolean
  disabled?: boolean
  maxDate?: Date
  label?: string
}

const MONTHS = [
  { value: 1, label: 'Enero' },
  { value: 2, label: 'Febrero' },
  { value: 3, label: 'Marzo' },
  { value: 4, label: 'Abril' },
  { value: 5, label: 'Mayo' },
  { value: 6, label: 'Junio' },
  { value: 7, label: 'Julio' },
  { value: 8, label: 'Agosto' },
  { value: 9, label: 'Septiembre' },
  { value: 10, label: 'Octubre' },
  { value: 11, label: 'Noviembre' },
  { value: 12, label: 'Diciembre' },
]

export function DatePicker({
  value,
  onChange,
  error = false,
  disabled = false,
  maxDate,
  label,
}: DatePickerProps) {
  const currentYear = new Date().getFullYear()
  const maxYear = maxDate ? maxDate.getFullYear() : currentYear

  // Parse current value
  const selectedYear = value ? parseInt(value.split('-')[0], 10) : 0
  const selectedMonth = value ? parseInt(value.split('-')[1], 10) : 0
  const selectedDay = value ? parseInt(value.split('-')[2], 10) : 0

  // Generate years list (newest first for easy scrolling to recent birth years)
  const years = useMemo(() => {
    const result: number[] = []
    for (let y = maxYear; y >= 1920; y--) {
      result.push(y)
    }
    return result
  }, [maxYear])

  // Days in the selected month/year
  const daysInMonth = useMemo(() => {
    if (!selectedMonth || !selectedYear) return 31
    return new Date(selectedYear, selectedMonth, 0).getDate()
  }, [selectedYear, selectedMonth])

  // Update date, keeping valid day
  const updateDate = (year: number, month: number, day: number) => {
    // If year or month not set, can't build date yet
    if (!year && !month && !day) {
      onChange('')
      return
    }

    // If we have at least year and month, calculate max days
    if (year && month) {
      const maxDays = new Date(year, month, 0).getDate()
      day = Math.min(day || 1, maxDays)
    }

    if (year && month && day) {
      // Check against maxDate
      const date = new Date(year, month - 1, day)
      if (maxDate && date > maxDate) {
        // Clamp to maxDate
        onChange(
          `${maxDate.getFullYear()}-${String(maxDate.getMonth() + 1).padStart(2, '0')}-${String(maxDate.getDate()).padStart(2, '0')}`
        )
        return
      }
      onChange(`${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`)
    } else if (year && month) {
      // Year and month selected but no day yet — keep partial
      onChange(`${year}-${String(month).padStart(2, '0')}-01`)
    } else {
      onChange('')
    }
  }

  const handleYearChange = (yearStr: string) => {
    const year = yearStr ? parseInt(yearStr, 10) : 0
    updateDate(year, selectedMonth, selectedDay)
  }

  const handleMonthChange = (monthStr: string) => {
    const month = monthStr ? parseInt(monthStr, 10) : 0
    updateDate(selectedYear, month, selectedDay)
  }

  const handleDayChange = (dayStr: string) => {
    const day = dayStr ? parseInt(dayStr, 10) : 0
    updateDate(selectedYear, selectedMonth, day)
  }

  const selectClass = `w-full appearance-none rounded-xl border bg-[#F8FAFC] px-3 py-3 text-sm text-[#0F172A] transition-colors focus:border-[#00288e] focus:outline-none focus:ring-2 focus:ring-[#00288e]/20 disabled:opacity-50 ${
    error ? 'border-[#DC2626]' : 'border-[#E2E8F0]'
  }`

  return (
    <div>
      {label && (
        <label className="mb-2 block text-[11px] font-bold tracking-wide text-[#475569]">
          {label}
        </label>
      )}
      <div className="grid grid-cols-3 gap-2">
        {/* Day */}
        <div className="relative">
          <select
            value={selectedDay || ''}
            onChange={(e) => handleDayChange(e.target.value)}
            disabled={disabled}
            className={selectClass}
            style={{ minHeight: 48 }}
          >
            <option value="" disabled>
              Día
            </option>
            {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center">
            <svg className="h-4 w-4 text-[#94A3B8]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        {/* Month */}
        <div className="relative">
          <select
            value={selectedMonth || ''}
            onChange={(e) => handleMonthChange(e.target.value)}
            disabled={disabled}
            className={selectClass}
            style={{ minHeight: 48 }}
          >
            <option value="" disabled>
              Mes
            </option>
            {MONTHS.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center">
            <svg className="h-4 w-4 text-[#94A3B8]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        {/* Year */}
        <div className="relative">
          <select
            value={selectedYear || ''}
            onChange={(e) => handleYearChange(e.target.value)}
            disabled={disabled}
            className={selectClass}
            style={{ minHeight: 48 }}
          >
            <option value="" disabled>
              Año
            </option>
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center">
            <svg className="h-4 w-4 text-[#94A3B8]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      {/* Preview of selected date */}
      {value && (
        <p className="mt-1.5 text-[11px] text-[#00288e]">
          {selectedDay} de {MONTHS.find((m) => m.value === selectedMonth)?.label?.toLowerCase()} de {selectedYear}
        </p>
      )}
    </div>
  )
}
