'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useAppState, CHECKIN_QUESTIONS } from '@/lib/app-state'
import { AppHeader } from '@/components/app-header'
import { BottomNav } from '@/components/bottom-nav'
import { MaterialIcon } from '@/components/icons'
import { StatusBadge, getSeverityStyles } from '@/components/status-badge'
import type { AnswerSeverity } from '@/lib/app-state'

interface CheckInData {
  id: string
  severity: string
  comment: string | null
  createdAt: string
  answers: {
    id: string
    questionIndex: number
    question: string
    answer: string
    severity: string
  }[]
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function CheckinHistoryScreen() {
  const { patientId, patientName, setScreen } = useAppState()
  const [checkIns, setCheckIns] = useState<CheckInData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const fetchHistory = useCallback(async () => {
    if (!patientId) {
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/checkins?patientId=${encodeURIComponent(patientId)}`)
      if (!res.ok) {
        setError('Error al cargar historial')
        return
      }
      const data = await res.json()
      setCheckIns(data.checkIns)
    } catch {
      setError('Error de conexión')
    } finally {
      setLoading(false)
    }
  }, [patientId])

  useEffect(() => {
    void fetchHistory()
  }, [fetchHistory])

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id)
  }

  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader
        icon="monitor_heart"
        title="CardioCheck"
        subtitle="Historial de Registros"
      />

      <main className="flex-1 overflow-y-auto px-4 pb-24 pt-5">
        {/* Title */}
        <div className="mb-5">
          <h2 className="mb-1 text-lg font-extrabold text-[#0F172A]">
            Historial de Check-ins
          </h2>
          <p className="text-[13px] leading-relaxed text-[#475569]">
            {patientName ? `Registros de ${patientName}` : 'Sus registros diarios'}
          </p>
        </div>

        {/* No patient selected */}
        {!patientId && (
          <div
            className="mb-4 rounded-[24px] p-8 text-center"
            style={{
              backgroundColor: '#FFFFFF',
              boxShadow:
                '0 10px 25px -5px rgba(15,40,100,0.14), 0 8px 10px -6px rgba(15,40,100,0.07)',
            }}
          >
            <MaterialIcon name="person_off" size={48} className="mb-3 text-[#94A3B8]" />
            <p className="text-sm font-bold text-[#0F172A]">Sin paciente seleccionado</p>
            <p className="mt-1 text-[12px] text-[#475569]">
              Regístrese primero para ver su historial
            </p>
            <button
              onClick={() => setScreen('patient-data')}
              className="mt-4 rounded-2xl px-6 py-3 text-[13px] font-bold text-white"
              style={{ backgroundColor: '#00288e', minHeight: 44 }}
            >
              Registrarme
            </button>
          </div>
        )}

        {/* Loading */}
        {patientId && loading && (
          <div className="flex flex-col items-center justify-center py-12">
            <svg className="mb-3 h-8 w-8 animate-spin text-[#00288e]" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <p className="text-[13px] text-[#475569]">Cargando historial...</p>
          </div>
        )}

        {/* Error */}
        {patientId && error && !loading && (
          <div
            className="mb-4 rounded-xl border-2 p-4"
            style={{
              backgroundColor: '#FEF2F2',
              borderColor: '#FECACA',
            }}
          >
            <p className="text-[12px] font-semibold text-[#7F1D1D]">{error}</p>
            <button
              onClick={() => void fetchHistory()}
              className="mt-2 text-[11px] font-bold text-[#DC2626] underline"
            >
              Reintentar
            </button>
          </div>
        )}

        {/* No check-ins */}
        {patientId && !loading && !error && checkIns.length === 0 && (
          <div
            className="mb-4 rounded-[24px] p-8 text-center"
            style={{
              backgroundColor: '#FFFFFF',
              boxShadow:
                '0 10px 25px -5px rgba(15,40,100,0.14), 0 8px 10px -6px rgba(15,40,100,0.07)',
            }}
          >
            <MaterialIcon name="event_note" size={48} className="mb-3 text-[#94A3B8]" />
            <p className="text-sm font-bold text-[#0F172A]">Sin registros aún</p>
            <p className="mt-1 text-[12px] text-[#475569]">
              Aún no ha realizado ningún check-in
            </p>
            <button
              onClick={() => setScreen('flow')}
              className="mt-4 rounded-2xl px-6 py-3 text-[13px] font-bold text-white"
              style={{ backgroundColor: '#00288e', minHeight: 44 }}
            >
              Hacer Check-in
            </button>
          </div>
        )}

        {/* Check-in List */}
        {patientId && !loading && !error && checkIns.length > 0 && (
          <div className="space-y-3">
            {checkIns.map((ci) => {
              const isExpanded = expandedId === ci.id
              const severityStyle = getSeverityStyles(ci.severity as AnswerSeverity)

              return (
                <div
                  key={ci.id}
                  className="overflow-hidden rounded-[20px] border"
                  style={{
                    borderColor: '#E2E8F0',
                    backgroundColor: '#FFFFFF',
                    boxShadow:
                      '0 4px 12px -2px rgba(15,40,100,0.08), 0 2px 6px -2px rgba(15,40,100,0.04)',
                  }}
                >
                  {/* Header */}
                  <button
                    onClick={() => toggleExpand(ci.id)}
                    className="flex w-full items-center justify-between px-4 py-3.5 text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="flex h-9 w-9 items-center justify-center rounded-full"
                        style={{ backgroundColor: severityStyle.bg }}
                      >
                        <MaterialIcon name="assignment" size={18} style={{ color: severityStyle.border }} />
                      </div>
                      <div>
                        <p className="text-[13px] font-bold text-[#0F172A]">
                          {formatDate(ci.createdAt)}
                        </p>
                        {ci.comment && (
                          <p className="mt-0.5 text-[11px] text-[#475569] line-clamp-1">
                            &ldquo;{ci.comment}&rdquo;
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusBadge severity={ci.severity as AnswerSeverity} />
                      <MaterialIcon
                        name={isExpanded ? 'expand_less' : 'expand_more'}
                        size={20}
                        className="text-[#94A3B8]"
                      />
                    </div>
                  </button>

                  {/* Expanded Content */}
                  {isExpanded && (
                    <div className="border-t px-4 py-3" style={{ borderColor: '#E2E8F0' }}>
                      <div className="space-y-2">
                        {ci.answers.map((answer) => {
                          const answerSeverityStyle = getSeverityStyles(answer.severity as AnswerSeverity)
                          return (
                            <div
                              key={answer.id}
                              className="flex items-start gap-2 rounded-lg p-2.5"
                              style={{ backgroundColor: answerSeverityStyle.bg }}
                            >
                              <span className="text-[13px]">
                                {CHECKIN_QUESTIONS[answer.questionIndex]?.emoji || '📋'}
                              </span>
                              <div className="flex-1">
                                <p className="text-[11px] font-semibold text-[#475569]">
                                  {answer.question}
                                </p>
                                <p className="text-[12px] font-bold" style={{ color: answerSeverityStyle.text }}>
                                  {answer.answer}
                                </p>
                              </div>
                              <StatusBadge severity={answer.severity as AnswerSeverity} showLabel={false} />
                            </div>
                          )
                        })}
                      </div>
                      {ci.comment && (
                        <div className="mt-2 flex items-start gap-2 rounded-lg bg-[#F8FAFC] p-2.5">
                          <MaterialIcon name="chat" size={14} className="mt-0.5 shrink-0 text-[#475569]" />
                          <p className="text-[12px] text-[#475569]">{ci.comment}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </main>

      <BottomNav
        items={[
          { label: 'Alertas', icon: 'notifications', active: false, onClick: () => setScreen('pin') },
          { label: 'Pacientes', icon: 'groups', active: false, onClick: () => setScreen('pin') },
          { label: 'Inicio', icon: 'home', active: false, onClick: () => setScreen('flow') },
          { label: 'Historial', icon: 'history', active: true, onClick: () => setScreen('history') },
          { label: 'Equipo', icon: 'medical_services', active: false, onClick: () => setScreen('pin') },
        ]}
      />
    </div>
  )
}
