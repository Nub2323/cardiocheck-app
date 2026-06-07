'use client'

import React, { useState } from 'react'
import { useAppState } from '@/lib/app-state'
import { AppHeader } from '@/components/app-header'
import { BottomNav } from '@/components/bottom-nav'
import { MaterialIcon } from '@/components/icons'
import { TipCard } from '@/components/tip-card'
import { DatePicker } from '@/components/ui/date-picker'

export function PatientDataScreen() {
  const { patientDni, setPatientDni, setPatientName, setPatientId, setScreen } = useAppState()
  const [birthDate, setBirthDate] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dniError, setDniError] = useState<string | null>(null)
  const [birthDateError, setBirthDateError] = useState<string | null>(null)

  const validateDni = (dni: string): boolean => {
    const digits = dni.replace(/\D/g, '')
    if (digits.length < 7 || digits.length > 8) {
      setDniError('El DNI debe tener entre 7 y 8 dígitos')
      return false
    }
    setDniError(null)
    return true
  }

  const validateBirthDate = (date: string): boolean => {
    if (!date) {
      setBirthDateError('La fecha de nacimiento es requerida')
      return false
    }
    const d = new Date(date)
    const now = new Date()
    if (d >= now) {
      setBirthDateError('La fecha no puede ser futura')
      return false
    }
    const age = now.getFullYear() - d.getFullYear()
    if (age < 1 || age > 120) {
      setBirthDateError('Fecha de nacimiento inválida')
      return false
    }
    setBirthDateError(null)
    return true
  }

  const canContinue =
    patientDni.trim().length >= 7 &&
    patientDni.trim().length <= 8 &&
    !dniError &&
    birthDate.length > 0 &&
    !birthDateError

  const handleContinue = async () => {
    if (!validateDni(patientDni)) return
    if (!validateBirthDate(birthDate)) return

    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/patients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dni: patientDni.trim(),
          birthDate,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Error al verificar paciente')
        return
      }

      // Patient verified — store their info
      setPatientName(data.patient.name)
      setPatientId(data.patient.id)
      setScreen('consent')
    } catch {
      setError('Error de conexión. Intente de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader
        icon="monitor_heart"
        title="Unidad de Cuidados Cardiológicos"
        subtitle="CardioCheck"
      />

      <main className="flex-1 overflow-y-auto px-4 pb-24 pt-5">
        {/* Title */}
        <div className="mb-5">
          <h2
            className="mb-1 text-lg font-extrabold"
            style={{ color: '#0F172A' }}
          >
            Identificación del paciente
          </h2>
          <p className="text-[13px] leading-relaxed text-[#475569]">
            Ingrese su DNI y fecha de nacimiento para acceder al sistema de seguimiento
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
            <p className="text-[11px] leading-relaxed text-[#1E3A8A]">
              Solo los pacientes registrados por el equipo médico pueden acceder. Si no puede ingresar, solicite al personal de salud que lo registre en el sistema.
            </p>
          </div>
        </div>

        {/* Form Card */}
        <div
          className="mb-4 rounded-[24px] p-6"
          style={{
            backgroundColor: '#FFFFFF',
            boxShadow:
              '0 10px 25px -5px rgba(15,40,100,0.14), 0 8px 10px -6px rgba(15,40,100,0.07)',
          }}
        >
          {/* DNI Field */}
          <div className="mb-5">
            <label
              className="mb-2 block text-[11px] font-bold tracking-wide text-[#475569]"
              htmlFor="patient-dni"
            >
              DNI
            </label>
            <input
              id="patient-dni"
              type="text"
              inputMode="numeric"
              value={patientDni}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, '')
                setPatientDni(val)
                if (val.length >= 7 && val.length <= 8) {
                  setDniError(null)
                } else if (val.length > 0 && val.length < 7) {
                  setDniError('El DNI debe tener entre 7 y 8 dígitos')
                } else if (val.length > 8) {
                  setDniError('El DNI no puede tener más de 8 dígitos')
                } else {
                  setDniError(null)
                }
              }}
              placeholder="Ej: 28456789"
              className="w-full rounded-xl border bg-[#F8FAFC] px-4 py-3 text-sm text-[#0F172A] placeholder:text-[#94A3B8] focus:border-[#00288e] focus:outline-none focus:ring-2 focus:ring-[#00288e]/20"
              style={{
                minHeight: 48,
                borderColor: dniError ? '#DC2626' : '#E2E8F0',
              }}
              autoComplete="off"
              maxLength={8}
            />
            {dniError && (
              <p className="mt-1.5 text-[11px] font-semibold text-[#DC2626]">
                {dniError}
              </p>
            )}
          </div>

          {/* Birth Date Field */}
          <div>
            <DatePicker
              value={birthDate}
              onChange={(date) => {
                setBirthDate(date)
                if (date) {
                  setBirthDateError(null)
                }
              }}
              placeholder="Seleccionar fecha de nacimiento"
              error={!!birthDateError}
              maxDate={new Date()}
              label="FECHA DE NACIMIENTO"
            />
            {birthDateError && (
              <p className="mt-1.5 text-[11px] font-semibold text-[#DC2626]">
                {birthDateError}
              </p>
            )}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div
            className="mb-4 rounded-xl border-2 p-4"
            style={{
              backgroundColor: '#FEF2F2',
              borderColor: '#FECACA',
            }}
          >
            <div className="flex items-start gap-2">
              <MaterialIcon name="error" size={18} className="mt-0.5 shrink-0 text-[#DC2626]" />
              <div>
                <p className="text-[12px] font-semibold text-[#7F1D1D]">{error}</p>
                {error.includes('No se encontró') && (
                  <p className="mt-1 text-[11px] text-[#7F1D1D]/70">
                    Diríjase a la Unidad de Insuficiencia Cardíaca para solicitar su registro en el sistema.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Continue Button */}
        <button
          onClick={handleContinue}
          disabled={!canContinue || loading}
          className="mb-4 flex w-full items-center justify-center gap-2 rounded-2xl px-6 py-3.5 text-sm font-bold text-white transition-all active:scale-[0.97] disabled:opacity-40 disabled:active:scale-100"
          style={{
            backgroundColor: '#00288e',
            minHeight: 48,
          }}
        >
          {loading ? (
            <>
              <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Verificando...
            </>
          ) : (
            <>
              Ingresar
              <MaterialIcon name="chevron_right" size={18} />
            </>
          )}
        </button>

        {/* Tip Card */}
        <TipCard
          title="Verificación de identidad"
          text="Sus datos son verificados contra los registros del sistema para proteger su información. Solo el equipo médico puede registrar nuevos pacientes."
        />

        {/* Footer */}
        <div className="mt-4 rounded-2xl border border-[#E2E8F0] bg-white/60 p-4">
          <p className="text-center text-[10px] leading-relaxed text-[#94A3B8]">
            ⚕️ Sus datos están protegidos conforme a la Ley 25.326 de Protección de Datos Personales.
          </p>
        </div>
      </main>

      <BottomNav
        items={[
          { label: 'Alertas', icon: 'notifications', active: false, onClick: () => setScreen('pin') },
          { label: 'Pacientes', icon: 'groups', active: false, onClick: () => setScreen('pin') },
          { label: 'Inicio', icon: 'home', active: true, onClick: () => setScreen('welcome') },
          { label: 'Progreso', icon: 'trending_up', active: false, onClick: () => setScreen('patient-data') },
          { label: 'Equipo', icon: 'medical_services', active: false, onClick: () => setScreen('pin') },
        ]}
      />
    </div>
  )
}
