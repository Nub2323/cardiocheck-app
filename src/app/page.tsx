'use client'

import React from 'react'
import { useAppState } from '@/lib/app-state'
import { WelcomeScreen } from '@/components/screens/welcome'
import { PatientDataScreen } from '@/components/screens/patient-data'
import { InformedConsentScreen } from '@/components/screens/informed-consent'
import { PatientFlowScreen, CheckinScreen } from '@/components/screens/patient-flow'
import { AdditionalCommentsScreen } from '@/components/screens/additional-comments'
import { PinAccessScreen } from '@/components/screens/pin-access'
import { AdminAlertsScreen } from '@/components/screens/admin-alerts'
import { CheckinCompleteScreen } from '@/components/screens/checkin-complete'
import { CheckinHistoryScreen } from '@/components/screens/checkin-history'
import { AdminPatientsScreen } from '@/components/screens/admin-patients'

function ScreenRouter() {
  const { currentScreen } = useAppState()

  switch (currentScreen) {
    case 'welcome':
      return <WelcomeScreen />
    case 'patient-data':
      return <PatientDataScreen />
    case 'consent':
      return <InformedConsentScreen />
    case 'flow':
      return <PatientFlowScreen />
    case 'checkin':
      return <CheckinScreen />
    case 'comments':
      return <AdditionalCommentsScreen />
    case 'complete':
      return <CheckinCompleteScreen />
    case 'pin':
      return <PinAccessScreen />
    case 'admin':
      return <AdminAlertsScreen />
    case 'admin-patients':
      return <AdminPatientsScreen />
    case 'history':
      return <CheckinHistoryScreen />
    default:
      return <WelcomeScreen />
  }
}

export default function Home() {
  return (
    <div
      className="flex min-h-screen items-start justify-center"
      style={{
        background: 'linear-gradient(135deg, #DBEAFE 0%, #E0F2FE 50%, #D1FAE5 100%)',
      }}
    >
      <div
        className="relative w-full max-w-[400px] min-h-screen bg-white/0"
      >
        <ScreenRouter />
      </div>
    </div>
  )
}
