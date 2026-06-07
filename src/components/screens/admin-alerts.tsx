'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useAppState } from '@/lib/app-state'
import { AppHeader } from '@/components/app-header'
import { BottomNav } from '@/components/bottom-nav'
import { MaterialIcon } from '@/components/icons'
import { StatusBadge } from '@/components/status-badge'
import type { AnswerSeverity } from '@/lib/app-state'

interface AlertData {
  id: string
  status: string
  createdAt: string
  checkIn: {
    id: string
    severity: string
    comment: string | null
    answers: {
      id: string
      questionIndex: number
      question: string
      answer: string
      severity: string
    }[]
    patient: {
      id: string
      name: string
      dni: string
    }
  }
}

function formatTimeAgo(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMin = Math.floor(diffMs / 60000)
  if (diffMin < 1) return 'Ahora mismo'
  if (diffMin < 60) return `Hace ${diffMin} min`
  const diffHours = Math.floor(diffMin / 60)
  if (diffHours < 24) return `Hace ${diffHours}h`
  const diffDays = Math.floor(diffHours / 24)
  return `Hace ${diffDays}d`
}

function getAlertSeverityInfo(severity: string): {
  severity: 'urgent' | 'followup'
  badgeText: string
  badgeColor: { bg: string; border: string; text: string }
} {
  if (severity === 'red') {
    return {
      severity: 'urgent',
      badgeText: 'URGENTE',
      badgeColor: { bg: '#FEE2E2', border: '#DC2626', text: '#7F1D1D' },
    }
  }
  return {
    severity: 'followup',
    badgeText: 'SEGUIMIENTO',
    badgeColor: { bg: '#FEF3C7', border: '#D97706', text: '#78350F' },
  }
}

export function AdminAlertsScreen() {
  const { setScreen, setIsAdmin } = useAppState()
  const [alerts, setAlerts] = useState<AlertData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchAlerts = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/alerts')
      if (!res.ok) {
        setError('Error al cargar alertas')
        return
      }
      const data = await res.json()
      setAlerts(data.alerts)
    } catch {
      setError('Error de conexión')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void fetchAlerts()
  }, [fetchAlerts])

  const handleDismiss = async (alertId: string) => {
    try {
      const res = await fetch('/api/alerts', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ alertId, status: 'dismissed' }),
      })
      if (res.ok) {
        setAlerts((prev) => prev.filter((a) => a.id !== alertId))
      }
    } catch {
      // Silently fail
    }
  }

  const handleWhatsApp = (patientName: string) => {
    window.open(`https://wa.me/5491100000000?text=${encodeURIComponent(`Hola, contacto desde CardioCheck respecto al paciente ${patientName}.`)}`, '_blank')
  }

  const handleEmail = (patientName: string) => {
    window.open(`mailto:contacto@cardiocheck.app?subject=${encodeURIComponent(`Alerta de seguimiento - ${patientName}`)}&body=${encodeURIComponent(`Se ha generado una alerta de seguimiento para el paciente ${patientName}.`)}`, '_blank')
  }

  const handleCall = () => {
    window.open('tel:+5491100000001', '_blank')
  }

  const handleLogout = () => {
    setIsAdmin(false)
    setScreen('welcome')
  }

  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader
        icon="favorite"
        title="CardioCheck"
        subtitle="Panel de Enfermería"
      />

      <main className="flex-1 overflow-y-auto px-4 pb-24 pt-4">
        {/* Title */}
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-extrabold text-[#0F172A]">Alertas Pendientes</h2>
            <p className="text-[12px] text-[#475569]">
              Casos críticos que requieren contacto inmediato
            </p>
          </div>
          <button
            onClick={() => void fetchAlerts()}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] transition-all active:scale-95"
            disabled={loading}
          >
            <MaterialIcon
              name="refresh"
              size={18}
              className={loading ? 'animate-spin text-[#94A3B8]' : 'text-[#475569]'}
            />
          </button>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-12">
            <svg className="mb-3 h-8 w-8 animate-spin text-[#00288e]" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <p className="text-[13px] text-[#475569]">Cargando alertas...</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div
            className="mb-4 rounded-xl border-2 p-4"
            style={{
              backgroundColor: '#FEF2F2',
              borderColor: '#FECACA',
            }}
          >
            <p className="text-[12px] font-semibold text-[#7F1D1D]">{error}</p>
            <button
              onClick={() => void fetchAlerts()}
              className="mt-2 text-[11px] font-bold text-[#DC2626] underline"
            >
              Reintentar
            </button>
          </div>
        )}

        {/* Alert Cards */}
        {!loading && !error && alerts.length === 0 ? (
          <div
            className="mb-4 rounded-[24px] p-8 text-center"
            style={{
              backgroundColor: '#FFFFFF',
              boxShadow:
                '0 10px 25px -5px rgba(15,40,100,0.14), 0 8px 10px -6px rgba(15,40,100,0.07)',
            }}
          >
            <div
              className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full"
              style={{ backgroundColor: '#DCFCE7' }}
            >
              <MaterialIcon name="check_circle" size={44} className="text-[#16A34A]" />
            </div>
            <p className="mb-1 text-base font-bold text-[#0F172A]">Sin alertas pendientes</p>
            <p className="mb-4 text-[13px] text-[#475569]">
              Todos los pacientes se encuentran en buen estado. Las alertas aparecerán aquí cuando un paciente reporte síntomas preocupantes.
            </p>
            <div
              className="inline-flex items-center gap-2 rounded-xl px-4 py-2"
              style={{ backgroundColor: '#F0FDF4' }}
            >
              <MaterialIcon name="schedule" size={16} className="text-[#166534]" />
              <span className="text-[11px] font-semibold text-[#166534]">
                Próximo check-in: 8:00 - 11:00 hs
              </span>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {alerts.map((alert) => {
              const info = getAlertSeverityInfo(alert.checkIn.severity)
              const warningAnswers = alert.checkIn.answers.filter(
                (a) => !['green', 'neutral'].includes(a.severity)
              )

              return (
                <div
                  key={alert.id}
                  className="overflow-hidden rounded-[20px] border-2"
                  style={{
                    borderColor:
                      info.severity === 'urgent' ? '#FECACA' : '#FDE68A',
                    backgroundColor: '#FFFFFF',
                    boxShadow:
                      '0 10px 25px -5px rgba(15,40,100,0.14), 0 8px 10px -6px rgba(15,40,100,0.07)',
                  }}
                >
                  {/* Alert Header */}
                  <div
                    className="flex items-center justify-between border-b px-4 py-3"
                    style={{
                      backgroundColor:
                        info.severity === 'urgent' ? '#FEF2F2' : '#FFFBEB',
                      borderColor:
                        info.severity === 'urgent' ? '#FECACA' : '#FDE68A',
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="rounded-full border px-2.5 py-0.5 text-[10px] font-extrabold"
                        style={{
                          backgroundColor: info.badgeColor.bg,
                          borderColor: info.badgeColor.border,
                          color: info.badgeColor.text,
                        }}
                      >
                        {info.badgeText}
                      </span>
                      <span className="text-[11px] text-[#475569]">
                        {formatTimeAgo(alert.createdAt)}
                      </span>
                    </div>
                    <button
                      onClick={() => void handleDismiss(alert.id)}
                      className="text-[11px] font-semibold text-[#94A3B8] transition-colors hover:text-[#475569]"
                    >
                      Descartar
                    </button>
                  </div>

                  {/* Alert Body */}
                  <div className="p-4">
                    {/* Patient Info */}
                    <div className="mb-3">
                      <div className="flex items-center gap-2">
                        <div
                          className="flex h-9 w-9 items-center justify-center rounded-full"
                          style={{
                            backgroundColor:
                              info.severity === 'urgent' ? '#FEE2E2' : '#FEF3C7',
                          }}
                        >
                          <MaterialIcon
                            name="groups"
                            size={18}
                            style={{
                              color:
                                info.severity === 'urgent' ? '#DC2626' : '#D97706',
                            }}
                          />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-bold text-[#0F172A]">
                            {alert.checkIn.patient.name}
                          </p>
                          <p className="text-[11px] text-[#475569]">
                            DNI: {alert.checkIn.patient.dni}
                          </p>
                        </div>
                        <StatusBadge severity={alert.checkIn.severity as AnswerSeverity} />
                      </div>
                    </div>

                    {/* Symptoms */}
                    <div className="mb-4 space-y-1.5">
                      {warningAnswers.map((answer) => (
                        <div
                          key={answer.id}
                          className="flex items-start gap-2 rounded-lg px-3 py-2"
                          style={{
                            backgroundColor:
                              info.severity === 'urgent' ? '#FEF2F2' : '#FFFBEB',
                          }}
                        >
                          <MaterialIcon
                            name="warning"
                            size={14}
                            className="mt-0.5 shrink-0"
                            style={{
                              color:
                                info.severity === 'urgent' ? '#DC2626' : '#D97706',
                            }}
                          />
                          <p
                            className="text-[12px] italic"
                            style={{
                              color:
                                info.severity === 'urgent' ? '#7F1D1D' : '#78350F',
                            }}
                          >
                            &ldquo;{answer.answer}&rdquo;
                          </p>
                        </div>
                      ))}
                      {alert.checkIn.comment && (
                        <div className="flex items-start gap-2 rounded-lg bg-[#F8FAFC] px-3 py-2">
                          <MaterialIcon name="chat" size={14} className="mt-0.5 shrink-0 text-[#475569]" />
                          <p className="text-[12px] italic text-[#475569]">
                            &ldquo;{alert.checkIn.comment}&rdquo;
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleWhatsApp(alert.checkIn.patient.name)}
                        className="flex flex-1 items-center justify-center gap-1.5 rounded-xl px-3 py-2.5 text-[11px] font-bold transition-all active:scale-[0.97]"
                        style={{
                          backgroundColor: '#DCFCE7',
                          color: '#166534',
                          minHeight: 40,
                        }}
                      >
                        <MaterialIcon name="chat" size={14} className="text-[#166534]" />
                        WhatsApp
                      </button>
                      <button
                        onClick={() => handleEmail(alert.checkIn.patient.name)}
                        className="flex flex-1 items-center justify-center gap-1.5 rounded-xl px-3 py-2.5 text-[11px] font-bold transition-all active:scale-[0.97]"
                        style={{
                          backgroundColor: '#DBEAFE',
                          color: '#1E3A8A',
                          minHeight: 40,
                        }}
                      >
                        <MaterialIcon name="mail" size={14} className="text-[#1E3A8A]" />
                        Email
                      </button>
                      <button
                        onClick={handleCall}
                        className="flex flex-1 items-center justify-center gap-1.5 rounded-xl px-3 py-2.5 text-[11px] font-bold transition-all active:scale-[0.97]"
                        style={{
                          backgroundColor: '#FEF3C7',
                          color: '#78350F',
                          minHeight: 40,
                        }}
                      >
                        <MaterialIcon name="medical_services" size={14} className="text-[#78350F]" />
                        Médico
                      </button>
                    </div>
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
          { label: 'Alertas', icon: 'notifications', active: true, onClick: () => setScreen('admin') },
          { label: 'Pacientes', icon: 'groups', active: false, onClick: () => setScreen('admin-patients') },
          { label: 'Historial', icon: 'history', active: false, onClick: () => setScreen('admin') },
          { label: 'Consejos', icon: 'lightbulb', active: false, onClick: () => setScreen('admin') },
          { label: 'Ajustes', icon: 'settings', active: false, onClick: () => handleLogout() },
        ]}
      />
    </div>
  )
}
