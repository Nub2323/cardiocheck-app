'use client'

import React, { useState } from 'react'
import { useAppState, CHECKIN_QUESTIONS } from '@/lib/app-state'
import { AppHeader } from '@/components/app-header'
import { BottomNav } from '@/components/bottom-nav'
import { MaterialIcon } from '@/components/icons'
import { PulseHeartSVG } from '@/components/heart-svg'
import { getSeverityStyles } from '@/components/status-badge'
import type { AnswerSeverity } from '@/lib/app-state'

function isCheckinTime(): boolean {
  const now = new Date()
  const hours = now.getHours()
  return hours >= 8 && hours < 11
}

function formatTimeWindow(): string {
  return '8:00 - 11:00'
}

export function PatientFlowScreen() {
  const { setScreen, resetFlow } = useAppState()
  const [isInHours] = useState(() => isCheckinTime())
  const [loading, setLoading] = useState(false)

  const handleStartCheckin = () => {
    setLoading(true)
    setTimeout(() => {
      resetFlow()
      setScreen('checkin')
      setLoading(false)
    }, 1200)
  }

  return (
    <div className="flex min-h-screen flex-col">
      {/* Tall Header */}
      <header
        className="flex flex-col items-center justify-center gap-1 px-4 text-white"
        style={{
          height: 120,
          background: 'linear-gradient(135deg, #1E3A8A 0%, #1D4ED8 100%)',
        }}
      >
        <PulseHeartSVG size={36} />
        <p className="text-sm font-extrabold tracking-wide">CARDIOCHECK</p>
        <p className="text-[11px] text-white/70">Unidad de Cuidados Cardiológicos</p>
      </header>

      <main className="flex-1 overflow-y-auto px-4 pb-24 pt-5">
        {/* Welcome Text */}
        <div className="mb-4 text-center">
          <h2 className="mb-1 text-lg font-extrabold text-[#0F172A]">
            Bienvenido/a
          </h2>
          <p className="text-[13px] leading-relaxed text-[#475569]">
            Registro diario de su estado de salud cardiológica
          </p>
        </div>

        {/* Hospital Image Card */}
        <div
          className="mb-5 overflow-hidden rounded-[20px]"
          style={{
            background: 'linear-gradient(135deg, rgba(30,58,138,0.7) 0%, rgba(29,78,216,0.5) 100%)',
            minHeight: 100,
          }}
        >
          <div className="flex flex-col items-center justify-center p-5 text-center text-white">
            <MaterialIcon name="monitor_heart" size={32} className="mb-1 text-white/90" />
            <p className="text-[12px] font-bold">CardioCheck</p>
            <p className="text-[10px] text-white/70">Seguimiento Cardiológico</p>
          </div>
        </div>

        <div
          className="mb-4 rounded-[24px] p-6 text-center"
          style={{
            backgroundColor: '#FFFFFF',
            boxShadow:
              '0 10px 25px -5px rgba(15,40,100,0.14), 0 8px 10px -6px rgba(15,40,100,0.07)',
          }}
        >
          <div className="mb-3 flex justify-center">
            <MaterialIcon name="schedule" size={36} className={isInHours ? 'text-[#00288e]' : 'text-[#94A3B8]'} />
          </div>
          <h3 className="mb-1 text-sm font-bold text-[#0F172A]">
            {isInHours ? 'Horario de Check-in Activo' : 'Fuera del Horario de Check-in'}
          </h3>
          <p className="mb-4 text-[12px] text-[#475569]">
            {isInHours
              ? `Puede realizar su registro diario ahora (${formatTimeWindow()} hs)`
              : `El registro diario está disponible de ${formatTimeWindow()} hs. Puede realizar el chequeo con una advertencia.`}
          </p>
          {!isInHours && (
            <div
              className="mb-4 rounded-xl border-2 p-3 text-left"
              style={{
                backgroundColor: '#FEF9C3',
                borderColor: '#CA8A04',
              }}
            >
              <div className="flex items-center gap-2">
                <MaterialIcon name="warning" size={16} className="text-[#CA8A04]" />
                <p className="text-[11px] font-semibold text-[#713F12]">
                  Está fuera del horario habitual. Si tiene una urgencia, diríjase a la guardia más cercana o llame al 107.
                </p>
              </div>
            </div>
          )}
          <button
            onClick={handleStartCheckin}
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-2xl px-6 py-3.5 text-sm font-bold text-white transition-all active:scale-[0.97] disabled:opacity-70"
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
                Cargando...
              </>
            ) : (
              <>
                Empezar
                <MaterialIcon name="arrow_forward" size={18} />
              </>
            )}
          </button>
          <button
            onClick={() => setScreen('history')}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-[#00288e] px-6 py-3 text-[13px] font-bold transition-all active:scale-[0.97]"
            style={{
              color: '#00288e',
              minHeight: 44,
            }}
          >
            <MaterialIcon name="history" size={18} />
            Ver Historial
          </button>
        </div>
      </main>

      <BottomNav
        items={[
          { label: 'Alertas', icon: 'notifications', active: false, onClick: () => setScreen('pin') },
          { label: 'Pacientes', icon: 'groups', active: false, onClick: () => setScreen('pin') },
          { label: 'Inicio', icon: 'home', active: true, onClick: () => setScreen('flow') },
          { label: 'Historial', icon: 'history', active: false, onClick: () => setScreen('history') },
          { label: 'Equipo', icon: 'medical_services', active: false, onClick: () => setScreen('pin') },
        ]}
      />
    </div>
  )
}

/* ---- Check-in Question Screen ---- */

export function CheckinScreen() {
  const { currentQuestion, answers, setCurrentQuestion, setAnswer, setScreen } = useAppState()
  const question = CHECKIN_QUESTIONS[currentQuestion]
  const totalQuestions = CHECKIN_QUESTIONS.length
  const progress = ((currentQuestion + 1) / totalQuestions) * 100

  // Derive selected option from stored answers, with local override capability
  const [localSelection, setLocalSelection] = useState<string | null>(null)
  const selectedOption = localSelection ?? answers[currentQuestion] ?? null

  const handleSelect = (optionLabel: string, severity: AnswerSeverity) => {
    setLocalSelection(optionLabel)
    setAnswer(currentQuestion, optionLabel, severity)
  }

  const handleNext = () => {
    if (!selectedOption) return
    if (currentQuestion < totalQuestions - 1) {
      setCurrentQuestion(currentQuestion + 1)
      setLocalSelection(null)
    } else {
      setScreen('comments')
    }
  }

  const handleBack = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
    } else {
      setScreen('flow')
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader
        icon="monitor_heart"
        title="Unidad de Cuidados Cardiológicos"
        subtitle="CardioCheck"
      />

      <main className="flex-1 overflow-y-auto px-4 pb-8 pt-4">
        {/* Progress Bar */}
        <div className="mb-5">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-[12px] font-bold text-[#0F172A]">
              Pregunta {currentQuestion + 1} de {totalQuestions}
            </span>
            <span className="text-[12px] font-bold text-[#00288e]">
              {Math.round(progress)}%
            </span>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-[#E2E8F0]">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${progress}%`,
                backgroundColor: progress === 100 ? '#16A34A' : '#00288e',
              }}
            />
          </div>
        </div>

        {/* Question Card */}
        <div
          className="mb-5 rounded-[24px] p-6"
          style={{
            backgroundColor: '#FFFFFF',
            boxShadow:
              '0 10px 25px -5px rgba(15,40,100,0.14), 0 8px 10px -6px rgba(15,40,100,0.07)',
          }}
        >
          <div className="mb-3 flex items-center gap-3">
            <span className="text-2xl">{question.emoji}</span>
            <h3 className="text-[15px] font-bold leading-snug text-[#0F172A]">
              {question.question}
            </h3>
          </div>

          {/* Answer Options */}
          <div className="space-y-2.5">
            {question.options.map((option) => {
              const isSelected = selectedOption === option.label
              const severityStyle = getSeverityStyles(option.severity)
              const isWarning =
                option.severity === 'yellow' ||
                option.severity === 'yellow-high' ||
                option.severity === 'yellow-low'
              const isRed = option.severity === 'red'

              return (
                <button
                  key={option.label}
                  onClick={() => handleSelect(option.label, option.severity)}
                  className="flex w-full items-center gap-3 rounded-xl border-2 px-4 py-3 text-left text-[13px] font-medium transition-all active:scale-[0.98]"
                  style={{
                    minHeight: 48,
                    borderColor: isSelected
                      ? severityStyle.border
                      : isRed
                        ? '#FECACA'
                        : isWarning
                          ? '#FEF3C7'
                          : '#E2E8F0',
                    backgroundColor: isSelected
                      ? severityStyle.bg
                      : isRed
                        ? '#FEF2F2'
                        : isWarning
                          ? '#FFFBEB'
                          : '#F8FAFC',
                    color: isSelected ? severityStyle.text : '#0F172A',
                  }}
                >
                  <span
                    className="h-3 w-3 shrink-0 rounded-full border-2"
                    style={{
                      borderColor: isSelected ? severityStyle.border : '#CBD5E1',
                      backgroundColor: isSelected ? severityStyle.border : 'transparent',
                    }}
                  />
                  <span className="flex-1">{option.label}</span>
                  {isRed && (
                    <MaterialIcon name="warning" size={16} className="shrink-0 text-[#DC2626]" />
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex gap-3">
          <button
            onClick={handleBack}
            className="flex flex-1 items-center justify-center gap-1 rounded-2xl border-2 border-[#E2E8F0] px-4 py-3 text-[13px] font-semibold text-[#475569] transition-all active:scale-[0.97]"
            style={{ minHeight: 48 }}
          >
            <MaterialIcon name="arrow_back" size={16} />
            Anterior
          </button>
          <button
            onClick={handleNext}
            disabled={!selectedOption}
            className="flex flex-1 items-center justify-center gap-1 rounded-2xl px-4 py-3 text-[13px] font-bold text-white transition-all active:scale-[0.97] disabled:opacity-40 disabled:active:scale-100"
            style={{
              backgroundColor: '#00288e',
              minHeight: 48,
            }}
          >
            {currentQuestion < totalQuestions - 1 ? 'Siguiente' : 'Finalizar'}
            <MaterialIcon name="chevron_right" size={16} />
          </button>
        </div>
      </main>
    </div>
  )
}
