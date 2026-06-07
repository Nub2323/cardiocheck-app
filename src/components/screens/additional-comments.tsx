'use client'

import React, { useState } from 'react'
import { useAppState, CHECKIN_QUESTIONS, deriveOverallSeverity } from '@/lib/app-state'
import { AppHeader } from '@/components/app-header'
import { MaterialIcon } from '@/components/icons'
import { TipCard } from '@/components/tip-card'

export function AdditionalCommentsScreen() {
  const { answers, answerSeverities, patientId, setAdditionalComment, setScreen } = useAppState()
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const progress = 100

  const handleFinish = async () => {
    setSubmitting(true)
    setError(null)

    try {
      // Build answers array from store
      const answersArray = CHECKIN_QUESTIONS.map((q, index) => ({
        questionIndex: index,
        question: q.question,
        answer: answers[index] || '',
        severity: answerSeverities[index] || 'green',
      }))

      // Derive overall severity
      const severities = answersArray.map((a) => a.severity)
      const overallSeverity = deriveOverallSeverity(severities)

      setAdditionalComment(comment)

      const res = await fetch('/api/checkins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId,
          answers: answersArray,
          comment: comment || null,
          overallSeverity,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error || 'Error al enviar el registro')
        return
      }

      setScreen('complete')
    } catch {
      setError('Error de conexión. Intente de nuevo.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleBack = () => {
    setScreen('checkin')
  }

  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader
        icon="favorite"
        title="CardioCheck"
        subtitle="Seguimiento Remoto Cardiológico"
      />

      <main className="flex-1 overflow-y-auto px-4 pb-8 pt-4">
        {/* Progress Bar */}
        <div className="mb-5">
          <div className="mb-1 flex items-center justify-between">
            <span className="text-[11px] font-semibold text-[#475569]">
              Paso final
            </span>
            <span className="text-[11px] font-bold text-[#00288e]">{progress}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-[#E2E8F0]">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${progress}%`,
                backgroundColor: '#00288e',
              }}
            />
          </div>
        </div>

        {/* Comments Title Card */}
        <div
          className="mb-5 rounded-[24px] p-6"
          style={{
            backgroundColor: '#FFFFFF',
            boxShadow:
              '0 10px 25px -5px rgba(15,40,100,0.14), 0 8px 10px -6px rgba(15,40,100,0.07)',
          }}
        >
          <div className="mb-3 flex items-center gap-3">
            <span className="text-2xl">💬</span>
            <h3 className="text-[15px] font-bold leading-snug text-[#0F172A]">
              Comentarios adicionales
            </h3>
          </div>
          <p className="mb-3 text-[12px] text-[#475569]">
            Si lo desea, puede agregar comentarios sobre su estado o síntomas adicionales.
          </p>
        </div>

        {/* Comments Textarea */}
        <div
          className="mb-5 rounded-[24px] p-6"
          style={{
            backgroundColor: '#FFFFFF',
            boxShadow:
              '0 10px 25px -5px rgba(15,40,100,0.14), 0 8px 10px -6px rgba(15,40,100,0.07)',
          }}
        >
          <label className="mb-2 block text-[13px] font-bold text-[#0F172A]">
            ¿Desea agregar algún comentario o síntoma adicional?
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Escriba aquí cualquier síntoma o inquietud adicional..."
            rows={3}
            className="w-full resize-none rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3 text-[13px] text-[#0F172A] placeholder:text-[#94A3B8] focus:border-[#00288e] focus:outline-none focus:ring-2 focus:ring-[#00288e]/20"
          />
        </div>

        {/* Error Message */}
        {error && (
          <div
            className="mb-4 rounded-xl border-2 p-3"
            style={{
              backgroundColor: '#FEF2F2',
              borderColor: '#FECACA',
            }}
          >
            <p className="text-[12px] font-semibold text-[#7F1D1D]">{error}</p>
          </div>
        )}

        {/* Navigation */}
        <div className="mb-4 flex gap-3">
          <button
            onClick={handleBack}
            className="flex flex-1 items-center justify-center gap-1 rounded-2xl border-2 border-[#E2E8F0] px-4 py-3 text-[13px] font-semibold text-[#475569] transition-all active:scale-[0.97]"
            style={{ minHeight: 48 }}
          >
            <MaterialIcon name="arrow_back" size={16} />
            Anterior
          </button>
          <button
            onClick={handleFinish}
            disabled={submitting}
            className="flex flex-1 items-center justify-center gap-1 rounded-2xl px-4 py-3 text-[13px] font-bold text-white transition-all active:scale-[0.97] disabled:opacity-40"
            style={{
              backgroundColor: '#00288e',
              minHeight: 48,
            }}
          >
            {submitting ? (
              <>
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Enviando...
              </>
            ) : (
              <>
                Finalizar
                <MaterialIcon name="check_circle" size={16} />
              </>
            )}
          </button>
        </div>

        {/* Tip Card */}
        <TipCard
          title="Consejo para su descanso"
          text="Si necesita más almohadas para dormir, intente elevar la cabecera de la cama. Consulte con su médico si la dificultad para dormir empeora."
          icon="bed"
        />
      </main>
    </div>
  )
}
