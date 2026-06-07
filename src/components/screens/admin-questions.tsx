'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useAppState } from '@/lib/app-state'
import { AppHeader } from '@/components/app-header'
import { BottomNav } from '@/components/bottom-nav'
import { MaterialIcon } from '@/components/icons'
import type { AnswerSeverity } from '@/lib/app-state'

interface QuestionOption {
  label: string
  severity: AnswerSeverity
}

interface QuestionData {
  id: string
  order: number
  emoji: string
  question: string
  options: QuestionOption[]
  isCritical: boolean
  category: string
  isActive: boolean
}

const SEVERITY_OPTIONS: { value: AnswerSeverity; label: string; color: string }[] = [
  { value: 'green', label: 'Verde (OK)', color: '#16A34A' },
  { value: 'neutral', label: 'Neutral', color: '#6B7280' },
  { value: 'yellow-low', label: 'Amarillo bajo', color: '#CA8A04' },
  { value: 'yellow', label: 'Amarillo', color: '#D97706' },
  { value: 'yellow-high', label: 'Amarillo alto', color: '#EA580C' },
  { value: 'red', label: 'Rojo (Urgente)', color: '#DC2626' },
]

const EMOJI_OPTIONS = ['😊', '⚖️', '🫁', '🦶', '🛏️', '💊', '❤️', '🩺', '😴', '🤢', '🤕', '😰', '🔥', '💧', '❓']

const CATEGORY_OPTIONS = [
  { value: 'general', label: 'General' },
  { value: 'respiratory', label: 'Respiratorio' },
  { value: 'cardiac', label: 'Cardíaco' },
  { value: 'medication', label: 'Medicación' },
  { value: 'lifestyle', label: 'Estilo de vida' },
  { value: 'other', label: 'Otro' },
]

export function AdminQuestionsScreen() {
  const { setScreen, setIsAdmin, adminPin, setAdminPin } = useAppState()

  const adminHeaders = () => ({
    'Content-Type': 'application/json',
    'x-admin-pin': adminPin,
  })
  const [questions, setQuestions] = useState<QuestionData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  // Form state
  const [formEmoji, setFormEmoji] = useState('❓')
  const [formQuestion, setFormQuestion] = useState('')
  const [formCategory, setFormCategory] = useState('general')
  const [formIsCritical, setFormIsCritical] = useState(false)
  const [formOptions, setFormOptions] = useState<QuestionOption[]>([
    { label: '', severity: 'green' },
    { label: '', severity: 'neutral' },
    { label: '', severity: 'yellow' },
    { label: '', severity: 'red' },
  ])
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  const fetchQuestions = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      // First ensure questions are seeded
      await fetch('/api/questions', { method: 'POST' })
      const res = await fetch('/api/admin/questions', { headers: adminHeaders() })
      if (res.status === 401) {
        setIsAdmin(false)
        setAdminPin('')
        setScreen('pin')
        return
      }
      if (!res.ok) {
        setError('Error al cargar preguntas')
        return
      }
      const data = await res.json()
      setQuestions(data.questions)
    } catch {
      setError('Error de conexión')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void fetchQuestions()
  }, [fetchQuestions])

  const resetForm = () => {
    setFormEmoji('❓')
    setFormQuestion('')
    setFormCategory('general')
    setFormIsCritical(false)
    setFormOptions([
      { label: '', severity: 'green' },
      { label: '', severity: 'neutral' },
      { label: '', severity: 'yellow' },
      { label: '', severity: 'red' },
    ])
    setEditingId(null)
    setFormError(null)
  }

  const handleEdit = (q: QuestionData) => {
    setEditingId(q.id)
    setFormEmoji(q.emoji)
    setFormQuestion(q.question)
    setFormCategory(q.category)
    setFormIsCritical(q.isCritical)
    setFormOptions(q.options.length > 0 ? q.options : [{ label: '', severity: 'green' }])
    setShowForm(true)
    setFormError(null)
  }

  const handleToggleActive = async (q: QuestionData) => {
    try {
      const res = await fetch('/api/admin/questions', {
        method: 'PUT',
        headers: adminHeaders(),
        body: JSON.stringify({ id: q.id, isActive: !q.isActive }),
      })
      if (res.status === 401) {
        setIsAdmin(false)
        setAdminPin('')
        setScreen('pin')
        return
      }
      if (res.ok) {
        setQuestions((prev) =>
          prev.map((p) => (p.id === q.id ? { ...p, isActive: !q.isActive } : p))
        )
      }
    } catch {
      // silent
    }
  }

  const handleToggleCritical = async (q: QuestionData) => {
    try {
      const res = await fetch('/api/admin/questions', {
        method: 'PUT',
        headers: adminHeaders(),
        body: JSON.stringify({ id: q.id, isCritical: !q.isCritical }),
      })
      if (res.status === 401) {
        setIsAdmin(false)
        setAdminPin('')
        setScreen('pin')
        return
      }
      if (res.ok) {
        setQuestions((prev) =>
          prev.map((p) => (p.id === q.id ? { ...p, isCritical: !q.isCritical } : p))
        )
        setSuccessMsg(`Pregunta "${q.question.substring(0, 30)}..." ${!q.isCritical ? 'marcada como crítica (→ guardia)' : 'desmarcada como crítica'}`)
        setTimeout(() => setSuccessMsg(null), 3000)
      }
    } catch {
      // silent
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar esta pregunta?')) return
    try {
      const res = await fetch('/api/admin/questions', {
        method: 'DELETE',
        headers: adminHeaders(),
        body: JSON.stringify({ id }),
      })
      if (res.status === 401) {
        setIsAdmin(false)
        setAdminPin('')
        setScreen('pin')
        return
      }
      if (res.ok) {
        setQuestions((prev) => prev.filter((q) => q.id !== id))
      }
    } catch {
      // silent
    }
  }

  const handleSave = async () => {
    // Validate
    if (!formQuestion.trim()) {
      setFormError('La pregunta es requerida')
      return
    }
    const validOptions = formOptions.filter((o) => o.label.trim())
    if (validOptions.length < 2) {
      setFormError('Debe tener al menos 2 opciones')
      return
    }

    setSaving(true)
    setFormError(null)

    try {
      if (editingId) {
        // Update
        const res = await fetch('/api/admin/questions', {
          method: 'PUT',
          headers: adminHeaders(),
          body: JSON.stringify({
            id: editingId,
            emoji: formEmoji,
            question: formQuestion.trim(),
            category: formCategory,
            isCritical: formIsCritical,
            options: validOptions,
          }),
        })
        if (res.status === 401) {
          setIsAdmin(false)
          setAdminPin('')
          setScreen('pin')
          return
        }
        if (!res.ok) {
          const data = await res.json()
          setFormError(data.error || 'Error al actualizar')
          return
        }
        setSuccessMsg('Pregunta actualizada')
      } else {
        // Create
        const res = await fetch('/api/admin/questions', {
          method: 'POST',
          headers: adminHeaders(),
          body: JSON.stringify({
            emoji: formEmoji,
            question: formQuestion.trim(),
            category: formCategory,
            isCritical: formIsCritical,
            options: validOptions,
          }),
        })
        if (res.status === 401) {
          setIsAdmin(false)
          setAdminPin('')
          setScreen('pin')
          return
        }
        if (!res.ok) {
          const data = await res.json()
          setFormError(data.error || 'Error al crear')
          return
        }
        setSuccessMsg('Pregunta creada')
      }

      setShowForm(false)
      resetForm()
      void fetchQuestions()
      setTimeout(() => setSuccessMsg(null), 3000)
    } catch {
      setFormError('Error de conexión')
    } finally {
      setSaving(false)
    }
  }

  const addOption = () => {
    setFormOptions([...formOptions, { label: '', severity: 'yellow' }])
  }

  const removeOption = (index: number) => {
    if (formOptions.length <= 2) return
    setFormOptions(formOptions.filter((_, i) => i !== index))
  }

  const updateOption = (index: number, field: 'label' | 'severity', value: string) => {
    const updated = [...formOptions]
    if (field === 'severity') {
      updated[index] = { ...updated[index], severity: value as AnswerSeverity }
    } else {
      updated[index] = { ...updated[index], label: value }
    }
    setFormOptions(updated)
  }

  const getCategoryLabel = (cat: string) => {
    return CATEGORY_OPTIONS.find((c) => c.value === cat)?.label ?? cat
  }

  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader
        icon="quiz"
        title="Configuración de Preguntas"
        subtitle="CardioCheck"
      />

      <main className="flex-1 overflow-y-auto px-4 pb-24 pt-4">
        {/* Title + Add Button */}
        <div className="mb-4">
          <h2 className="text-lg font-extrabold text-[#0F172A]">Preguntas del Check-in</h2>
          <p className="text-[12px] text-[#475569]">
            {questions.length} pregunta{questions.length !== 1 ? 's' : ''} configurada{questions.length !== 1 ? 's' : ''}
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
              <p className="mb-1 font-bold">Semáforo de severidad:</p>
              <p>🟢 Verde = Sin preocupación &nbsp;|&nbsp; 🟡 Amarillo = Seguimiento &nbsp;|&nbsp; 🔴 Rojo = Urgente/Guardia</p>
              <p className="mt-1 font-bold">Pregunta crítica = Si el paciente responde algo que no sea verde, se le indica concurrir a guardia.</p>
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

        {/* Add Question Button */}
        {!showForm && (
          <button
            onClick={() => {
              resetForm()
              setShowForm(true)
            }}
            className="mb-4 flex w-full items-center justify-center gap-2.5 rounded-2xl px-6 py-3.5 text-sm font-bold text-white transition-all active:scale-[0.97]"
            style={{ backgroundColor: '#00288e', minHeight: 50 }}
          >
            <MaterialIcon name="add_circle" size={22} className="text-white" />
            Agregar Pregunta
          </button>
        )}

        {/* Form */}
        {showForm && (
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
                <MaterialIcon name="edit_note" size={20} className="text-[#00288e]" />
                <span className="text-[14px] font-bold text-[#00288e]">
                  {editingId ? 'Editar Pregunta' : 'Nueva Pregunta'}
                </span>
              </div>
              <button
                onClick={() => {
                  setShowForm(false)
                  resetForm()
                }}
                className="flex items-center gap-1 rounded-lg border border-[#BFDBFE] bg-white px-3 py-1.5 text-[11px] font-bold text-[#00288e] transition-all active:scale-95"
              >
                <MaterialIcon name="close" size={14} />
                Cancelar
              </button>
            </div>

            <div className="space-y-4 p-4">
              {/* Emoji + Category */}
              <div className="flex gap-3">
                <div className="w-20">
                  <label className="mb-1 block text-[11px] font-bold text-[#475569]">Ícono</label>
                  <select
                    value={formEmoji}
                    onChange={(e) => setFormEmoji(e.target.value)}
                    className="w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-2 py-3 text-center text-lg focus:border-[#00288e] focus:outline-none"
                  >
                    {EMOJI_OPTIONS.map((e) => (
                      <option key={e} value={e}>{e}</option>
                    ))}
                  </select>
                </div>
                <div className="flex-1">
                  <label className="mb-1 block text-[11px] font-bold text-[#475569]">Categoría</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-3 text-[13px] focus:border-[#00288e] focus:outline-none"
                  >
                    {CATEGORY_OPTIONS.map((c) => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Question Text */}
              <div>
                <label className="mb-1 block text-[11px] font-bold text-[#475569]">Pregunta</label>
                <input
                  type="text"
                  value={formQuestion}
                  onChange={(e) => setFormQuestion(e.target.value)}
                  placeholder="Ej: ¿Tiene dolor en el pecho?"
                  className="w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3 text-[14px] focus:border-[#00288e] focus:outline-none focus:ring-2 focus:ring-[#00288e]/20"
                  style={{ minHeight: 48 }}
                />
              </div>

              {/* Critical Toggle */}
              <div
                className="flex items-center justify-between rounded-xl border-2 p-3"
                style={{
                  backgroundColor: formIsCritical ? '#FEF2F2' : '#F8FAFC',
                  borderColor: formIsCritical ? '#FECACA' : '#E2E8F0',
                }}
              >
                <div className="flex items-center gap-2">
                  <MaterialIcon
                    name="emergency"
                    size={18}
                    className={formIsCritical ? 'text-[#DC2626]' : 'text-[#94A3B8]'}
                  />
                  <div>
                    <p className="text-[12px] font-bold" style={{ color: formIsCritical ? '#991B1B' : '#0F172A' }}>
                      Pregunta Crítica
                    </p>
                    <p className="text-[10px] text-[#475569]">
                      Cualquier problema → indicar guardia al paciente
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setFormIsCritical(!formIsCritical)}
                  className="relative h-7 w-12 rounded-full transition-colors"
                  style={{ backgroundColor: formIsCritical ? '#DC2626' : '#CBD5E1' }}
                >
                  <span
                    className="absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-all"
                    style={{ left: formIsCritical ? 22 : 2 }}
                  />
                </button>
              </div>

              {/* Options */}
              <div>
                <label className="mb-2 block text-[11px] font-bold text-[#475569]">Opciones de respuesta</label>
                <div className="space-y-2">
                  {formOptions.map((opt, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span
                        className="h-3 w-3 shrink-0 rounded-full"
                        style={{
                          backgroundColor: SEVERITY_OPTIONS.find((s) => s.value === opt.severity)?.color ?? '#94A3B8',
                        }}
                      />
                      <input
                        type="text"
                        value={opt.label}
                        onChange={(e) => updateOption(idx, 'label', e.target.value)}
                        placeholder={`Opción ${idx + 1}`}
                        className="flex-1 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-2 text-[12px] focus:border-[#00288e] focus:outline-none"
                      />
                      <select
                        value={opt.severity}
                        onChange={(e) => updateOption(idx, 'severity', e.target.value)}
                        className="rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-2 py-2 text-[11px] focus:border-[#00288e] focus:outline-none"
                      >
                        {SEVERITY_OPTIONS.map((s) => (
                          <option key={s.value} value={s.value}>{s.label}</option>
                        ))}
                      </select>
                      {formOptions.length > 2 && (
                        <button
                          onClick={() => removeOption(idx)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-[#94A3B8] transition-colors hover:bg-[#FEF2F2] hover:text-[#DC2626]"
                        >
                          <MaterialIcon name="close" size={14} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                {formOptions.length < 6 && (
                  <button
                    onClick={addOption}
                    className="mt-2 flex items-center gap-1 text-[11px] font-semibold text-[#00288e]"
                  >
                    <MaterialIcon name="add" size={14} />
                    Agregar opción
                  </button>
                )}
              </div>

              {/* Error */}
              {formError && (
                <div className="rounded-xl border-2 p-3" style={{ backgroundColor: '#FEF2F2', borderColor: '#FECACA' }}>
                  <p className="text-[11px] font-semibold text-[#DC2626]">{formError}</p>
                </div>
              )}

              {/* Save */}
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3.5 text-[14px] font-bold text-white transition-all active:scale-[0.97] disabled:opacity-40"
                style={{ backgroundColor: '#00288e', minHeight: 50 }}
              >
                {saving ? (
                  <>
                    <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Guardando...
                  </>
                ) : (
                  <>
                    <MaterialIcon name="check_circle" size={20} />
                    {editingId ? 'Guardar Cambios' : 'Crear Pregunta'}
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-12">
            <svg className="mb-3 h-8 w-8 animate-spin text-[#00288e]" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <p className="text-[13px] text-[#475569]">Cargando preguntas...</p>
          </div>
        )}

        {/* Question List */}
        {!loading && questions.length > 0 && (
          <div className="space-y-3">
            {questions.map((q) => (
              <div
                key={q.id}
                className="overflow-hidden rounded-[16px] border"
                style={{
                  borderColor: q.isCritical ? '#FECACA' : q.isActive ? '#E2E8F0' : '#E2E8F0',
                  backgroundColor: q.isActive ? '#FFFFFF' : '#F8FAFC',
                  boxShadow: q.isCritical
                    ? '0 4px 12px -2px rgba(220,38,38,0.15)'
                    : '0 4px 12px -2px rgba(15,40,100,0.08)',
                  opacity: q.isActive ? 1 : 0.6,
                }}
              >
                <div className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <span className="mt-0.5 text-xl">{q.emoji}</span>
                      <div>
                        <p className="text-[13px] font-bold text-[#0F172A]">{q.question}</p>
                        <div className="mt-1 flex flex-wrap items-center gap-1.5">
                          <span
                            className="rounded-full px-2 py-0.5 text-[9px] font-bold"
                            style={{
                              backgroundColor: '#EFF6FF',
                              color: '#00288e',
                            }}
                          >
                            {getCategoryLabel(q.category)}
                          </span>
                          {q.isCritical && (
                            <span
                              className="rounded-full px-2 py-0.5 text-[9px] font-bold"
                              style={{
                                backgroundColor: '#FEF2F2',
                                color: '#DC2626',
                              }}
                            >
                              CRÍTICA → GUARDIA
                            </span>
                          )}
                          {!q.isActive && (
                            <span
                              className="rounded-full px-2 py-0.5 text-[9px] font-bold"
                              style={{
                                backgroundColor: '#F1F5F9',
                                color: '#64748B',
                              }}
                            >
                              INACTIVA
                            </span>
                          )}
                        </div>
                        <div className="mt-2 flex flex-wrap gap-1">
                          {q.options.map((opt, i) => (
                            <span
                              key={i}
                              className="rounded-md px-2 py-0.5 text-[10px]"
                              style={{
                                backgroundColor:
                                  SEVERITY_OPTIONS.find((s) => s.value === opt.severity)?.color + '15',
                                color: SEVERITY_OPTIONS.find((s) => s.value === opt.severity)?.color,
                                border: `1px solid ${SEVERITY_OPTIONS.find((s) => s.value === opt.severity)?.color}30`,
                              }}
                            >
                              {opt.label}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* Actions */}
                  <div className="mt-3 flex items-center gap-2 border-t border-[#E2E8F0] pt-3">
                    <button
                      onClick={() => handleEdit(q)}
                      className="flex items-center gap-1 rounded-lg border border-[#E2E8F0] px-2.5 py-1.5 text-[10px] font-bold text-[#475569] transition-all active:scale-95 hover:border-[#00288e] hover:text-[#00288e]"
                    >
                      <MaterialIcon name="edit" size={12} />
                      Editar
                    </button>
                    <button
                      onClick={() => handleToggleCritical(q)}
                      className="flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-[10px] font-bold transition-all active:scale-95"
                      style={{
                        borderColor: q.isCritical ? '#FECACA' : '#E2E8F0',
                        color: q.isCritical ? '#DC2626' : '#475569',
                        backgroundColor: q.isCritical ? '#FEF2F2' : 'transparent',
                      }}
                    >
                      <MaterialIcon name="emergency" size={12} />
                      {q.isCritical ? 'Quitar crítica' : 'Marcar crítica'}
                    </button>
                    <button
                      onClick={() => handleToggleActive(q)}
                      className="flex items-center gap-1 rounded-lg border border-[#E2E8F0] px-2.5 py-1.5 text-[10px] font-bold text-[#475569] transition-all active:scale-95"
                    >
                      <MaterialIcon name={q.isActive ? 'visibility_off' : 'visibility'} size={12} />
                      {q.isActive ? 'Desactivar' : 'Activar'}
                    </button>
                    <button
                      onClick={() => handleDelete(q.id)}
                      className="ml-auto flex items-center gap-1 rounded-lg border border-[#FECACA] px-2.5 py-1.5 text-[10px] font-bold text-[#DC2626] transition-all active:scale-95"
                    >
                      <MaterialIcon name="delete" size={12} />
                      Eliminar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Back to Admin */}
        <button
          onClick={() => setScreen('admin')}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-[#E2E8F0] px-4 py-3 text-[13px] font-semibold text-[#475569] transition-all active:scale-[0.97]"
          style={{ minHeight: 48 }}
        >
          <MaterialIcon name="arrow_back" size={16} />
          Volver al Panel
        </button>
      </main>

      <BottomNav
        items={[
          { label: 'Alertas', icon: 'notifications', active: false, onClick: () => setScreen('admin') },
          { label: 'Pacientes', icon: 'groups', active: false, onClick: () => setScreen('admin-patients') },
          { label: 'Preguntas', icon: 'quiz', active: true, onClick: () => setScreen('admin-questions') },
          { label: 'Inicio', icon: 'home', active: false, onClick: () => setScreen('welcome') },
          { label: 'Ajustes', icon: 'settings', active: false, onClick: () => setScreen('admin-settings') },
        ]}
      />
    </div>
  )
}
