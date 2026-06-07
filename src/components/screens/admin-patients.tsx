'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useAppState } from '@/lib/app-state'
import { AppHeader } from '@/components/app-header'
import { BottomNav } from '@/components/bottom-nav'
import { MaterialIcon } from '@/components/icons'
import { StatusBadge } from '@/components/status-badge'
import { DatePicker } from '@/components/ui/date-picker'
import type { AnswerSeverity } from '@/lib/app-state'

interface PatientData {
  id: string
  name: string
  dni: string
  birthDate: string | null
  createdAt: string
  latestCheckIn: {
    id: string
    severity: string
    createdAt: string
  } | null
}

export function AdminPatientsScreen() {
  const { setScreen } = useAppState()
  const [patients, setPatients] = useState<PatientData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newName, setNewName] = useState('')
  const [newDni, setNewDni] = useState('')
  const [newBirthDate, setNewBirthDate] = useState('')
  const [adding, setAdding] = useState(false)
  const [addError, setAddError] = useState<string | null>(null)
  const [addSuccess, setAddSuccess] = useState<string | null>(null)

  const fetchPatients = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/patients')
      if (!res.ok) {
        setError('Error al cargar pacientes')
        return
      }
      const data = await res.json()
      setPatients(data.patients)
    } catch {
      setError('Error de conexión')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void fetchPatients()
  }, [fetchPatients])

  const handleAddPatient = async () => {
    if (!newName.trim() || !newDni.trim()) {
      setAddError('Nombre y DNI son requeridos')
      return
    }

    const dniDigits = newDni.replace(/\D/g, '')
    if (dniDigits.length < 7 || dniDigits.length > 8) {
      setAddError('El DNI debe tener entre 7 y 8 dígitos')
      return
    }

    setAdding(true)
    setAddError(null)

    try {
      const res = await fetch('/api/admin/patients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newName.trim(),
          dni: dniDigits,
          birthDate: newBirthDate || null,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setAddError(data.error || 'Error al registrar paciente')
        return
      }

      setAddSuccess(`Paciente ${data.patient.name} registrado exitosamente`)
      setNewName('')
      setNewDni('')
      setNewBirthDate('')
      setShowAddForm(false)

      // Refresh list
      void fetchPatients()

      setTimeout(() => setAddSuccess(null), 3000)
    } catch {
      setAddError('Error de conexión')
    } finally {
      setAdding(false)
    }
  }

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '—'
    const d = new Date(dateStr)
    return d.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' })
  }

  const handleLogout = () => {
    setScreen('welcome')
  }

  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader
        icon="groups"
        title="Gestión de Pacientes"
        subtitle="CardioCheck"
      />

      <main className="flex-1 overflow-y-auto px-4 pb-24 pt-4">
        {/* Title + Actions */}
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-extrabold text-[#0F172A]">Pacientes Registrados</h2>
            <p className="text-[12px] text-[#475569]">
              {patients.length} paciente{patients.length !== 1 ? 's' : ''} en el sistema
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => void fetchPatients()}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] transition-all active:scale-95"
              disabled={loading}
            >
              <MaterialIcon
                name="refresh"
                size={18}
                className={loading ? 'animate-spin text-[#94A3B8]' : 'text-[#475569]'}
              />
            </button>
            <button
              onClick={() => {
                setShowAddForm(!showAddForm)
                setAddError(null)
                setAddSuccess(null)
              }}
              className="flex h-9 w-9 items-center justify-center rounded-xl transition-all active:scale-95"
              style={{ backgroundColor: '#00288e' }}
            >
              <MaterialIcon name="person_add" size={18} className="text-white" />
            </button>
          </div>
        </div>

        {/* Success Message */}
        {addSuccess && (
          <div
            className="mb-4 rounded-xl border-2 p-3"
            style={{
              backgroundColor: '#DCFCE7',
              borderColor: '#86EFAC',
            }}
          >
            <div className="flex items-center gap-2">
              <MaterialIcon name="check_circle" size={16} className="text-[#166534]" />
              <p className="text-[12px] font-semibold text-[#166534]">{addSuccess}</p>
            </div>
          </div>
        )}

        {/* Add Patient Form */}
        {showAddForm && (
          <div
            className="mb-4 overflow-hidden rounded-[20px] border-2"
            style={{
              borderColor: '#BFDBFE',
              backgroundColor: '#FFFFFF',
              boxShadow: '0 10px 25px -5px rgba(15,40,100,0.14)',
            }}
          >
            <div
              className="flex items-center justify-between border-b px-4 py-3"
              style={{
                backgroundColor: '#EFF6FF',
                borderColor: '#BFDBFE',
              }}
            >
              <div className="flex items-center gap-2">
                <MaterialIcon name="person_add" size={18} className="text-[#00288e]" />
                <span className="text-[13px] font-bold text-[#00288e]">Registrar Nuevo Paciente</span>
              </div>
              <button
                onClick={() => {
                  setShowAddForm(false)
                  setAddError(null)
                }}
                className="text-[11px] font-semibold text-[#94A3B8]"
              >
                Cerrar
              </button>
            </div>
            <div className="p-4 space-y-3">
              {/* Name */}
              <div>
                <label className="mb-1 block text-[10px] font-bold tracking-wide text-[#475569]">
                  NOMBRE Y APELLIDO
                </label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Ej: María García"
                  className="w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-2.5 text-[13px] text-[#0F172A] placeholder:text-[#94A3B8] focus:border-[#00288e] focus:outline-none focus:ring-2 focus:ring-[#00288e]/20"
                  style={{ minHeight: 42 }}
                />
              </div>
              {/* DNI */}
              <div>
                <label className="mb-1 block text-[10px] font-bold tracking-wide text-[#475569]">
                  DNI
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={newDni}
                  onChange={(e) => setNewDni(e.target.value.replace(/\D/g, ''))}
                  placeholder="Ej: 28456789"
                  className="w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-2.5 text-[13px] text-[#0F172A] placeholder:text-[#94A3B8] focus:border-[#00288e] focus:outline-none focus:ring-2 focus:ring-[#00288e]/20"
                  style={{ minHeight: 42 }}
                  maxLength={8}
                />
              </div>
              {/* Birth Date */}
              <div>
                <DatePicker
                  value={newBirthDate}
                  onChange={(date) => setNewBirthDate(date)}
                  placeholder="Seleccionar fecha de nacimiento"
                  maxDate={new Date()}
                  label="FECHA DE NACIMIENTO (requerida para verificación)"
                />
              </div>
              {/* Error */}
              {addError && (
                <p className="text-[11px] font-semibold text-[#DC2626]">{addError}</p>
              )}
              {/* Submit */}
              <button
                onClick={() => void handleAddPatient()}
                disabled={adding || !newName.trim() || !newDni.trim()}
                className="flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-[12px] font-bold text-white transition-all active:scale-[0.97] disabled:opacity-40"
                style={{
                  backgroundColor: '#00288e',
                  minHeight: 42,
                }}
              >
                {adding ? (
                  <>
                    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Registrando...
                  </>
                ) : (
                  <>
                    <MaterialIcon name="check" size={16} />
                    Registrar Paciente
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-12">
            <svg className="mb-3 h-8 w-8 animate-spin text-[#00288e]" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <p className="text-[13px] text-[#475569]">Cargando pacientes...</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div
            className="mb-4 rounded-xl border-2 p-4"
            style={{ backgroundColor: '#FEF2F2', borderColor: '#FECACA' }}
          >
            <p className="text-[12px] font-semibold text-[#7F1D1D]">{error}</p>
            <button
              onClick={() => void fetchPatients()}
              className="mt-2 text-[11px] font-bold text-[#DC2626] underline"
            >
              Reintentar
            </button>
          </div>
        )}

        {/* Patient List */}
        {!loading && !error && patients.length === 0 ? (
          <div
            className="rounded-[24px] p-8 text-center"
            style={{
              backgroundColor: '#FFFFFF',
              boxShadow: '0 10px 25px -5px rgba(15,40,100,0.14)',
            }}
          >
            <MaterialIcon name="groups" size={48} className="mb-3 text-[#94A3B8]" />
            <p className="text-sm font-bold text-[#0F172A]">Sin pacientes registrados</p>
            <p className="text-[12px] text-[#475569]">
              Pulse el botón + para registrar el primer paciente
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {patients.map((patient) => {
              const severity = patient.latestCheckIn?.severity as AnswerSeverity | undefined
              return (
                <div
                  key={patient.id}
                  className="overflow-hidden rounded-[16px] border"
                  style={{
                    borderColor: '#E2E8F0',
                    backgroundColor: '#FFFFFF',
                    boxShadow: '0 4px 12px -2px rgba(15,40,100,0.08)',
                  }}
                >
                  <div className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className="flex h-10 w-10 items-center justify-center rounded-full"
                          style={{ backgroundColor: '#EFF6FF' }}
                        >
                          <MaterialIcon name="person" size={20} className="text-[#00288e]" />
                        </div>
                        <div>
                          <p className="text-[13px] font-bold text-[#0F172A]">{patient.name}</p>
                          <p className="text-[11px] text-[#475569]">
                            DNI: {patient.dni}
                            {patient.birthDate && ` · Nac: ${formatDate(patient.birthDate)}`}
                          </p>
                        </div>
                      </div>
                      {severity && <StatusBadge severity={severity} />}
                    </div>
                    {patient.latestCheckIn && (
                      <div className="mt-2 rounded-lg bg-[#F8FAFC] px-3 py-2">
                        <p className="text-[10px] text-[#475569]">
                          Último check-in: {new Date(patient.latestCheckIn.createdAt).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="mt-4 w-full rounded-xl border-2 border-[#E2E8F0] px-4 py-3 text-[12px] font-semibold text-[#475569] transition-all active:scale-[0.97]"
          style={{ minHeight: 44 }}
        >
          Cerrar sesión de administrador
        </button>
      </main>

      <BottomNav
        items={[
          { label: 'Alertas', icon: 'notifications', active: false, onClick: () => setScreen('admin') },
          { label: 'Pacientes', icon: 'groups', active: true, onClick: () => setScreen('admin-patients') },
          { label: 'Inicio', icon: 'home', active: false, onClick: () => setScreen('welcome') },
          { label: 'Historial', icon: 'history', active: false, onClick: () => setScreen('admin') },
          { label: 'Ajustes', icon: 'settings', active: false, onClick: () => handleLogout() },
        ]}
      />
    </div>
  )
}
