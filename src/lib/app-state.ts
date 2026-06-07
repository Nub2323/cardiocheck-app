import { create } from 'zustand'

export type ScreenId =
  | 'welcome'
  | 'patient-data'
  | 'consent'
  | 'flow'
  | 'checkin'
  | 'comments'
  | 'complete'
  | 'pin'
  | 'admin'
  | 'admin-patients'
  | 'admin-questions'
  | 'admin-settings'
  | 'history'

export type AnswerSeverity = 'green' | 'neutral' | 'yellow-low' | 'yellow' | 'yellow-high' | 'red'

export interface CheckinOption {
  label: string
  severity: AnswerSeverity
}

export interface CheckinQuestion {
  id: string
  order: number
  emoji: string
  question: string
  options: CheckinOption[]
  isCritical: boolean
  category: string
}

// Severity ordering for deriving overall severity
export const SEVERITY_ORDER: Record<string, number> = {
  green: 0,
  neutral: 1,
  'yellow-low': 2,
  yellow: 3,
  'yellow-high': 4,
  red: 5,
}

export function deriveOverallSeverity(severities: string[]): string {
  if (severities.length === 0) return 'green'
  let maxSeverity = 'green'
  let maxOrder = 0
  for (const s of severities) {
    const order = SEVERITY_ORDER[s] ?? 0
    if (order > maxOrder) {
      maxOrder = order
      maxSeverity = s
    }
  }
  if (maxOrder >= 5) return 'red'
  if (maxOrder >= 4) return 'yellow-high'
  if (maxOrder >= 3) return 'yellow'
  if (maxOrder >= 2) return 'yellow'
  if (maxOrder >= 1) return 'neutral'
  return 'green'
}

interface AppState {
  currentScreen: ScreenId
  patientName: string
  patientDni: string
  patientId: string
  currentQuestion: number
  answers: Record<number, string>
  answerSeverities: Record<number, AnswerSeverity>
  answerQuestionIds: Record<number, string> // track which question each answer belongs to
  additionalComment: string
  isAdmin: boolean
  adminPin: string // store PIN for authenticated admin API calls
  consentAccepted: boolean
  checkinQuestions: CheckinQuestion[] // dynamic questions loaded from API
  needsGuardia: boolean // true if critical question had non-green answer

  setScreen: (screen: ScreenId) => void
  setPatientName: (name: string) => void
  setPatientDni: (dni: string) => void
  setPatientId: (id: string) => void
  setCurrentQuestion: (q: number) => void
  setAnswer: (questionIndex: number, answer: string, severity: AnswerSeverity) => void
  setAdditionalComment: (comment: string) => void
  setIsAdmin: (admin: boolean) => void
  setAdminPin: (pin: string) => void
  setConsentAccepted: (accepted: boolean) => void
  setCheckinQuestions: (questions: CheckinQuestion[]) => void
  setNeedsGuardia: (needs: boolean) => void
  resetFlow: () => void
}

export const useAppState = create<AppState>((set) => ({
  currentScreen: 'welcome',
  patientName: '',
  patientDni: '',
  patientId: '',
  currentQuestion: 0,
  answers: {},
  answerSeverities: {},
  answerQuestionIds: {},
  additionalComment: '',
  isAdmin: false,
  adminPin: '',
  consentAccepted: false,
  checkinQuestions: [],
  needsGuardia: false,

  setScreen: (screen) => set({ currentScreen: screen }),
  setPatientName: (name) => set({ patientName: name }),
  setPatientDni: (dni) => set({ patientDni: dni }),
  setPatientId: (id) => set({ patientId: id }),
  setCurrentQuestion: (q) => set({ currentQuestion: q }),
  setAnswer: (questionIndex, answer, severity) =>
    set((state) => {
      const question = state.checkinQuestions[questionIndex]
      const isCritical = question?.isCritical ?? false
      const isNonGreen = SEVERITY_ORDER[severity] >= 2 // yellow-low or worse

      return {
        answers: { ...state.answers, [questionIndex]: answer },
        answerSeverities: { ...state.answerSeverities, [questionIndex]: severity },
        answerQuestionIds: question
          ? { ...state.answerQuestionIds, [questionIndex]: question.id }
          : state.answerQuestionIds,
        needsGuardia: state.needsGuardia || (isCritical && isNonGreen),
      }
    }),
  setAdditionalComment: (comment) => set({ additionalComment: comment }),
  setIsAdmin: (admin) => set({ isAdmin: admin }),
  setAdminPin: (pin) => set({ adminPin: pin }),
  setConsentAccepted: (accepted) => set({ consentAccepted: accepted }),
  setCheckinQuestions: (questions) => set({ checkinQuestions: questions }),
  setNeedsGuardia: (needs) => set({ needsGuardia: needs }),
  resetFlow: () =>
    set({
      currentQuestion: 0,
      answers: {},
      answerSeverities: {},
      answerQuestionIds: {},
      additionalComment: '',
      needsGuardia: false,
    }),
}))
