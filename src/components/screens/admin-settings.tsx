'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useAppState } from '@/lib/app-state'
import { AppHeader } from '@/components/app-header'
import { BottomNav } from '@/components/bottom-nav'
import { MaterialIcon } from '@/components/icons'

interface SettingData {
  key: string
  value: string
  label: string
}

const SETTING_ICONS: Record<string, string> = {
  whatsapp_number: 'chat',
  doctor_phone: 'phone_in_talk',
  doctor_email: 'mail',
  hospital_name: 'local_hospital',
  alert_message: 'notifications',
}

const SETTING_COLORS: Record<string, { bg: string; color: string }> = {
  whatsapp_number: { bg: '#DCFCE7', color: '#166534' },
  doctor_phone: { bg: '#DBEAFE', color: '#1E3A8A' },
  doctor_email: { bg: '#EDE9FE', color: '#5B21B6' },
  hospital_name: { bg: '#FEF3C7', color: '#78350F' },
  alert_message: { bg: '#FFE4E6', color: '#9F1239' },
}

// Generate a secure 4-digit PIN that avoids obvious patterns
function generateSecurePin(): string {
  const digits = '0123456789'
  let pin = ''
  // First digit: random 1-9 (avoid leading 0)
  pin += digits[Math.floor(Math.random() * 9) + 1]
  for (let i = 1; i < 4; i++) {
    pin += digits[Math.floor(Math.random() * 10)]
  }
  // Reject obvious patterns and regenerate
  const obvious = ['1234', '4321', '1111', '2222', '3333', '4444', '5555', '6666', '7777', '8888', '9999', '0000', '1212', '2121', '1313', '3131', '6969', '1122', '2211', '1001', '2002', '1357', '2468', '9876', '0123', '9999']
  if (obvious.includes(pin)) return generateSecurePin()
  // Reject sequential
  const nums = pin.split('').map(Number)
  const isSequential = nums.every((n, i) => i === 0 || n === nums[i - 1] + 1) || nums.every((n, i) => i === 0 || n === nums[i - 1] - 1)
  if (isSequential) return generateSecurePin()
  return pin
}

function generateSuggestions(): string[] {
  const suggestions = new Set<string>()
  while (suggestions.size < 4) {
    suggestions.add(generateSecurePin())
  }
  return Array.from(suggestions)
}

// Strength indicator for a PIN
function getPinStrength(pin: string): { score: number; label: string; color: string } {
  if (pin.length < 4) return { score: 0, label: '', color: '' }

  const obvious = ['1234', '4321', '1111', '2222', '3333', '4444', '5555', '6666', '7777', '8888', '9999', '0000', '1212', '2121', '1313', '3131', '1122', '2211', '1001', '2002', '1357', '2468', '0123', '9876', '6969', '7777', '5555']
  if (obvious.includes(pin)) return { score: 1, label: 'Muy débil', color: '#DC2626' }

  const nums = pin.split('').map(Number)
  const allSame = nums.every(n => n === nums[0])
  if (allSame) return { score: 1, label: 'Muy débil', color: '#DC2626' }

  const isSequential = nums.every((n, i) => i === 0 || n === nums[i - 1] + 1) || nums.every((n, i) => i === 0 || n === nums[i - 1] - 1)
  if (isSequential) return { score: 1, label: 'Muy débil', color: '#DC2626' }

  const uniqueDigits = new Set(nums).size
  if (uniqueDigits === 4) return { score: 4, label: 'Fuerte', color: '#16A34A' }
  if (uniqueDigits === 3) return { score: 3, label: 'Buena', color: '#2563EB' }
  if (uniqueDigits === 2) return { score: 2, label: 'Regular', color: '#D97706' }
  return { score: 2, label: 'Regular', color: '#D97706' }
}

export function AdminSettingsScreen() {
  const { setScreen, setIsAdmin, adminPin, setAdminPin } = useAppState()

  const adminHeaders = () => ({
    'Content-Type': 'application/json',
    'x-admin-pin': adminPin,
  })
  const [settings, setSettings] = useState<SettingData[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)
  const [editValues, setEditValues] = useState<Record<string, string>>({})
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  // PIN change state
  const [showPinChange, setShowPinChange] = useState(false)
  const [currentPin, setCurrentPin] = useState('')
  const [newPin, setNewPin] = useState('')
  const [confirmPin, setConfirmPin] = useState('')
  const [pinSuggestions, setPinSuggestions] = useState<string[]>([])
  const [pinSaving, setPinSaving] = useState(false)
  const [pinError, setPinError] = useState<string | null>(null)
  const [pinSuccess, setPinSuccess] = useState(false)
  const [showCurrentPin, setShowCurrentPin] = useState(false)
  const [showNewPin, setShowNewPin] = useState(false)
  const [showConfirmPin, setShowConfirmPin] = useState(false)

  const fetchSettings = useCallback(async () => {
    setLoading(true)
    setErrorMsg(null)
    try {
      const res = await fetch('/api/admin/settings', { headers: adminHeaders() })
      if (res.status === 401) {
        setIsAdmin(false)
        setAdminPin('')
        setScreen('pin')
        return
      }
      if (!res.ok) {
        setErrorMsg('Error al cargar configuración')
        return
      }
      const data = await res.json()
      setSettings(data.settings)
      const vals: Record<string, string> = {}
      for (const s of data.settings) {
        vals[s.key] = s.value
      }
      setEditValues(vals)
    } catch {
      setErrorMsg('Error de conexión')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void fetchSettings()
  }, [fetchSettings])

  const handleSave = async (key: string) => {
    const value = editValues[key]
    if (value === undefined) return

    setSaving(key)
    setErrorMsg(null)
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: adminHeaders(),
        body: JSON.stringify({ key, value }),
      })
      if (res.status === 401) {
        setIsAdmin(false)
        setAdminPin('')
        setScreen('pin')
        return
      }
      if (!res.ok) {
        setErrorMsg('Error al guardar')
        return
      }
      setSettings((prev) =>
        prev.map((s) => (s.key === key ? { ...s, value } : s))
      )
      setSuccessMsg('Configuración guardada')
      setTimeout(() => setSuccessMsg(null), 2500)
    } catch {
      setErrorMsg('Error de conexión')
    } finally {
      setSaving(null)
    }
  }

  const handlePinChange = async () => {
    setPinError(null)
    setPinSuccess(false)

    if (!currentPin || currentPin.length !== 4) {
      setPinError('Ingrese su PIN actual de 4 dígitos')
      return
    }
    if (!newPin || newPin.length !== 4) {
      setPinError('Ingrese el nuevo PIN de 4 dígitos')
      return
    }
    if (newPin !== confirmPin) {
      setPinError('El nuevo PIN y la confirmación no coinciden')
      return
    }
    if (newPin === currentPin) {
      setPinError('El nuevo PIN debe ser diferente al actual')
      return
    }

    setPinSaving(true)
    try {
      // First verify current PIN
      const verifyRes = await fetch('/api/admin-pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin: currentPin }),
      })
      const verifyData = await verifyRes.json()

      if (!verifyData.valid) {
        setPinError('El PIN actual es incorrecto')
        setPinSaving(false)
        return
      }

      // Get the PIN record ID
      const listRes = await fetch('/api/admin-pin', { headers: adminHeaders() })
      if (listRes.status === 401) {
        setPinError('PIN inválido. Cerrando sesión...')
        setPinSaving(false)
        setIsAdmin(false)
        setAdminPin('')
        setScreen('pin')
        return
      }
      const listData = await listRes.json()
      const pinRecord = listData.pins?.[0]

      if (!pinRecord) {
        setPinError('No se encontró el registro del PIN')
        setPinSaving(false)
        return
      }

      // Update PIN
      const updateRes = await fetch('/api/admin-pin', {
        method: 'PUT',
        headers: adminHeaders(),
        body: JSON.stringify({ id: pinRecord.id, newPin, label: 'default' }),
      })

      if (updateRes.status === 401) {
        setPinError('PIN inválido. Cerrando sesión...')
        setPinSaving(false)
        setIsAdmin(false)
        setAdminPin('')
        setScreen('pin')
        return
      }

      if (!updateRes.ok) {
        setPinError('Error al actualizar el PIN')
        setPinSaving(false)
        return
      }

      setPinSuccess(true)
      setCurrentPin('')
      setNewPin('')
      setConfirmPin('')
      setPinSuggestions([])
      setTimeout(() => {
        setPinSuccess(false)
        setShowPinChange(false)
      }, 2000)
    } catch {
      setPinError('Error de conexión')
    } finally {
      setPinSaving(false)
    }
  }

  const handleRefreshSuggestions = () => {
    setPinSuggestions(generateSuggestions())
  }

  const handleSelectSuggestion = (suggestion: string) => {
    setNewPin(suggestion)
    setConfirmPin(suggestion)
  }

  const pinStrength = getPinStrength(newPin)

  const handleLogout = () => {
    setIsAdmin(false)
    setAdminPin('')
    setScreen('welcome')
  }

  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader
        icon="settings"
        title="Configuración"
        subtitle="CardioCheck"
      />

      <main className="flex-1 overflow-y-auto px-4 pb-24 pt-4">
        {/* Title */}
        <div className="mb-4">
          <h2 className="text-lg font-extrabold text-[#0F172A]">Ajustes de la Aplicación</h2>
          <p className="text-[12px] text-[#475569]">
            Configure los datos de contacto y opciones del sistema
          </p>
        </div>

        {/* Info Banner */}
        <div
          className="mb-4 rounded-2xl border-2 p-4"
          style={{
            backgroundColor: '#EFF6FF',
            borderColor: '#BFDBFE',
          }}
        >
          <div className="flex items-start gap-2">
            <MaterialIcon name="info" size={18} className="mt-0.5 shrink-0 text-[#00288e]" />
            <div className="text-[11px] leading-relaxed text-[#1E3A8A]">
              <p className="mb-1 font-bold">Estos datos se usan en las alertas:</p>
              <p>Cuando un paciente reporta un problema, las alertas usan el WhatsApp, teléfono y email que configure aquí para que el equipo médico pueda contactarlo rápidamente.</p>
            </div>
          </div>
        </div>

        {/* Success */}
        {successMsg && (
          <div
            className="mb-4 rounded-xl border-2 p-3"
            style={{ backgroundColor: '#DCFCE7', borderColor: '#86EFAC' }}
          >
            <div className="flex items-center gap-2">
              <MaterialIcon name="check_circle" size={16} className="text-[#166534]" />
              <p className="text-[12px] font-semibold text-[#166534]">{successMsg}</p>
            </div>
          </div>
        )}

        {/* Error */}
        {errorMsg && (
          <div
            className="mb-4 rounded-xl border-2 p-3"
            style={{ backgroundColor: '#FEF2F2', borderColor: '#FECACA' }}
          >
            <p className="text-[12px] font-semibold text-[#DC2626]">{errorMsg}</p>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-12">
            <svg className="mb-3 h-8 w-8 animate-spin text-[#00288e]" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <p className="text-[13px] text-[#475569]">Cargando configuración...</p>
          </div>
        )}

        {/* Settings List */}
        {!loading && settings.length > 0 && (
          <div className="space-y-3">
            {settings.map((s) => {
              const icon = SETTING_ICONS[s.key] || 'tune'
              const colors = SETTING_COLORS[s.key] || { bg: '#F1F5F9', color: '#475569' }
              const isSaving = saving === s.key

              return (
                <div
                  key={s.key}
                  className="overflow-hidden rounded-[16px] border"
                  style={{
                    borderColor: '#E2E8F0',
                    backgroundColor: '#FFFFFF',
                    boxShadow: '0 4px 12px -2px rgba(15,40,100,0.08)',
                  }}
                >
                  <div className="p-4">
                    {/* Label row */}
                    <div className="mb-3 flex items-center gap-3">
                      <div
                        className="flex h-9 w-9 items-center justify-center rounded-xl"
                        style={{ backgroundColor: colors.bg }}
                      >
                        <MaterialIcon name={icon} size={18} style={{ color: colors.color }} />
                      </div>
                      <div className="flex-1">
                        <p className="text-[13px] font-bold text-[#0F172A]">{s.label}</p>
                        <p className="text-[10px] text-[#94A3B8]">Clave: {s.key}</p>
                      </div>
                    </div>

                    {/* Input */}
                    <div className="flex gap-2">
                      <input
                        type={s.key === 'doctor_email' ? 'email' : 'text'}
                        value={editValues[s.key] ?? s.value}
                        onChange={(e) =>
                          setEditValues((prev) => ({ ...prev, [s.key]: e.target.value }))
                        }
                        className="flex-1 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3 text-[14px] text-[#0F172A] focus:border-[#00288e] focus:outline-none focus:ring-2 focus:ring-[#00288e]/20"
                        style={{ minHeight: 44 }}
                      />
                      <button
                        onClick={() => handleSave(s.key)}
                        disabled={isSaving || editValues[s.key] === s.value}
                        className="flex items-center justify-center gap-1 rounded-xl px-4 text-[12px] font-bold text-white transition-all active:scale-[0.97] disabled:opacity-40"
                        style={{ backgroundColor: '#00288e', minHeight: 44 }}
                      >
                        {isSaving ? (
                          <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                        ) : (
                          <>
                            <MaterialIcon name="save" size={14} />
                            Guardar
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* PIN Management Section */}
        <div className="mt-6">
          <h3 className="mb-3 text-sm font-extrabold text-[#0F172A]">Seguridad</h3>

          <div
            className="overflow-hidden rounded-[16px] border"
            style={{
              borderColor: '#E2E8F0',
              backgroundColor: '#FFFFFF',
              boxShadow: '0 4px 12px -2px rgba(15,40,100,0.08)',
            }}
          >
            {/* PIN Header - Always visible */}
            <button
              onClick={() => setShowPinChange(!showPinChange)}
              className="flex w-full items-center gap-3 p-4 text-left transition-colors active:bg-[#F8FAFC]"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#FEF3C7]">
                <MaterialIcon name="lock" size={18} className="text-[#78350F]" />
              </div>
              <div className="flex-1">
                <p className="text-[13px] font-bold text-[#0F172A]">Cambiar PIN de acceso</p>
                <p className="text-[10px] text-[#94A3B8]">Modifique la clave de acceso al panel</p>
              </div>
              <MaterialIcon
                name={showPinChange ? 'expand_less' : 'expand_more'}
                size={20}
                className="text-[#94A3B8]"
              />
            </button>

            {/* PIN Change Form - Expandable */}
            {showPinChange && (
              <div className="border-t border-[#E2E8F0] px-4 pb-4 pt-3">
                {/* PIN Success */}
                {pinSuccess && (
                  <div
                    className="mb-3 rounded-xl border-2 p-3"
                    style={{ backgroundColor: '#DCFCE7', borderColor: '#86EFAC' }}
                  >
                    <div className="flex items-center gap-2">
                      <MaterialIcon name="check_circle" size={16} className="text-[#166534]" />
                      <p className="text-[12px] font-semibold text-[#166534]">PIN actualizado correctamente</p>
                    </div>
                  </div>
                )}

                {/* PIN Error */}
                {pinError && (
                  <div
                    className="mb-3 rounded-xl border-2 p-3"
                    style={{ backgroundColor: '#FEF2F2', borderColor: '#FECACA' }}
                  >
                    <div className="flex items-center gap-2">
                      <MaterialIcon name="error" size={16} className="text-[#DC2626]" />
                      <p className="text-[12px] font-semibold text-[#DC2626]">{pinError}</p>
                    </div>
                  </div>
                )}

                {/* Current PIN */}
                <div className="mb-3">
                  <label className="mb-1.5 block text-[11px] font-bold text-[#475569]">
                    PIN actual
                  </label>
                  <div className="relative">
                    <input
                      type={showCurrentPin ? 'text' : 'password'}
                      inputMode="numeric"
                      maxLength={4}
                      value={currentPin}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '').slice(0, 4)
                        setCurrentPin(val)
                        setPinError(null)
                      }}
                      placeholder="Ingrese PIN actual"
                      className="w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3 pr-10 text-[14px] tracking-[0.3em] text-[#0F172A] focus:border-[#00288e] focus:outline-none focus:ring-2 focus:ring-[#00288e]/20"
                      style={{ minHeight: 44 }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPin(!showCurrentPin)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1"
                    >
                      <MaterialIcon
                        name={showCurrentPin ? 'visibility_off' : 'visibility'}
                        size={18}
                        className="text-[#94A3B8]"
                      />
                    </button>
                  </div>
                </div>

                {/* New PIN */}
                <div className="mb-3">
                  <label className="mb-1.5 block text-[11px] font-bold text-[#475569]">
                    Nuevo PIN
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPin ? 'text' : 'password'}
                      inputMode="numeric"
                      maxLength={4}
                      value={newPin}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '').slice(0, 4)
                        setNewPin(val)
                        if (confirmPin && val !== confirmPin) {
                          // keep confirm as-is
                        }
                        setPinError(null)
                      }}
                      placeholder="Ingrese nuevo PIN"
                      className="w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3 pr-10 text-[14px] tracking-[0.3em] text-[#0F172A] focus:border-[#00288e] focus:outline-none focus:ring-2 focus:ring-[#00288e]/20"
                      style={{ minHeight: 44 }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPin(!showNewPin)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1"
                    >
                      <MaterialIcon
                        name={showNewPin ? 'visibility_off' : 'visibility'}
                        size={18}
                        className="text-[#94A3B8]"
                      />
                    </button>
                  </div>

                  {/* PIN Strength indicator */}
                  {newPin.length === 4 && (
                    <div className="mt-2">
                      <div className="flex items-center gap-2">
                        <div className="flex flex-1 gap-1">
                          {[1, 2, 3, 4].map((level) => (
                            <div
                              key={level}
                              className="h-1.5 flex-1 rounded-full"
                              style={{
                                backgroundColor: level <= pinStrength.score ? pinStrength.color : '#E2E8F0',
                              }}
                            />
                          ))}
                        </div>
                        <span
                          className="text-[10px] font-bold"
                          style={{ color: pinStrength.color }}
                        >
                          {pinStrength.label}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Confirm PIN */}
                <div className="mb-3">
                  <label className="mb-1.5 block text-[11px] font-bold text-[#475569]">
                    Confirmar nuevo PIN
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPin ? 'text' : 'password'}
                      inputMode="numeric"
                      maxLength={4}
                      value={confirmPin}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '').slice(0, 4)
                        setConfirmPin(val)
                        setPinError(null)
                      }}
                      placeholder="Repita el nuevo PIN"
                      className="w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3 pr-10 text-[14px] tracking-[0.3em] text-[#0F172A] focus:border-[#00288e] focus:outline-none focus:ring-2 focus:ring-[#00288e]/20"
                      style={{
                        minHeight: 44,
                        borderColor: confirmPin && confirmPin !== newPin ? '#DC2626' : undefined,
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPin(!showConfirmPin)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1"
                    >
                      <MaterialIcon
                        name={showConfirmPin ? 'visibility_off' : 'visibility'}
                        size={18}
                        className="text-[#94A3B8]"
                      />
                    </button>
                  </div>
                  {confirmPin.length > 0 && confirmPin !== newPin && (
                    <p className="mt-1 text-[10px] font-semibold text-[#DC2626]">
                      Los PINs no coinciden
                    </p>
                  )}
                  {confirmPin.length === 4 && confirmPin === newPin && (
                    <p className="mt-1 text-[10px] font-semibold text-[#16A34A]">
                      Los PINs coinciden
                    </p>
                  )}
                </div>

                {/* Secure PIN Suggestions */}
                <div className="mb-4">
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-[11px] font-bold text-[#475569]">
                      Sugerencias de PIN seguro
                    </p>
                    <button
                      onClick={handleRefreshSuggestions}
                      className="flex items-center gap-1 text-[10px] font-semibold text-[#00288e]"
                    >
                      <MaterialIcon
                        name="refresh"
                        size={14}
                        className={pinSuggestions.length > 0 ? '' : ''}
                      />
                      Generar
                    </button>
                  </div>
                  {pinSuggestions.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {pinSuggestions.map((suggestion) => (
                        <button
                          key={suggestion}
                          onClick={() => handleSelectSuggestion(suggestion)}
                          className="flex items-center gap-1.5 rounded-xl border px-3 py-2 text-[14px] font-bold tracking-[0.2em] transition-all active:scale-[0.97]"
                          style={{
                            borderColor: newPin === suggestion ? '#00288e' : '#E2E8F0',
                            backgroundColor: newPin === suggestion ? '#00288e08' : '#F8FAFC',
                            color: newPin === suggestion ? '#00288e' : '#0F172A',
                          }}
                        >
                          {suggestion}
                          <MaterialIcon name="content_copy" size={12} className="text-[#94A3B8]" />
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div
                      className="rounded-xl border border-dashed border-[#CBD5E1] p-3 text-center"
                    >
                      <p className="text-[10px] text-[#94A3B8]">
                        Presione &quot;Generar&quot; para obtener PINs aleatorios seguros
                      </p>
                    </div>
                  )}
                </div>

                {/* Security Tips */}
                <div
                  className="mb-4 rounded-xl border p-3"
                  style={{ backgroundColor: '#FFFBEB', borderColor: '#FDE68A' }}
                >
                  <div className="flex items-start gap-2">
                    <MaterialIcon name="shield" size={14} className="mt-0.5 shrink-0 text-[#D97706]" />
                    <div className="text-[10px] leading-relaxed text-[#92400E]">
                      <p className="mb-1 font-bold">Consejos de seguridad:</p>
                      <ul className="ml-2 list-disc space-y-0.5">
                        <li>Evite secuencias como 1234 o 4321</li>
                        <li>No repita dígitos como 1111 o 2222</li>
                        <li>Use dígitos variados y sin significado obvio</li>
                        <li>Cambie el PIN periódicamente</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Save PIN Button */}
                <button
                  onClick={handlePinChange}
                  disabled={
                    pinSaving ||
                    !currentPin ||
                    currentPin.length !== 4 ||
                    !newPin ||
                    newPin.length !== 4 ||
                    !confirmPin ||
                    confirmPin.length !== 4 ||
                    newPin !== confirmPin
                  }
                  className="flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3.5 text-[13px] font-bold text-white transition-all active:scale-[0.97] disabled:opacity-40"
                  style={{ backgroundColor: '#00288e', minHeight: 48 }}
                >
                  {pinSaving ? (
                    <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  ) : (
                    <>
                      <MaterialIcon name="lock" size={16} />
                      Cambiar PIN
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-[#FECACA] px-4 py-3.5 text-[13px] font-bold text-[#DC2626] transition-all active:scale-[0.97]"
          style={{ minHeight: 48 }}
        >
          <MaterialIcon name="logout" size={18} />
          Cerrar sesión de administrador
        </button>
      </main>

      <BottomNav
        items={[
          { label: 'Alertas', icon: 'notifications', active: false, onClick: () => setScreen('admin') },
          { label: 'Pacientes', icon: 'groups', active: false, onClick: () => setScreen('admin-patients') },
          { label: 'Preguntas', icon: 'quiz', active: false, onClick: () => setScreen('admin-questions') },
          { label: 'Inicio', icon: 'home', active: false, onClick: () => setScreen('welcome') },
          { label: 'Ajustes', icon: 'settings', active: true, onClick: () => setScreen('admin-settings') },
        ]}
      />
    </div>
  )
}
