'use client'

import React from 'react'
import { useAppState } from '@/lib/app-state'
import { AppHeader } from '@/components/app-header'
import { MaterialIcon } from '@/components/icons'
import { TipCard } from '@/components/tip-card'

export function InformedConsentScreen() {
  const { setScreen, setConsentAccepted } = useAppState()

  const handleAccept = () => {
    setConsentAccepted(true)
    setScreen('flow')
  }

  const handleDecline = () => {
    setConsentAccepted(false)
    setScreen('welcome')
  }

  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader
        icon="monitor_heart"
        title="Unidad de Insuficiencia Cardíaca"
        subtitle="CardioCheck"
      />

      <main className="flex-1 overflow-y-auto px-4 pb-8 pt-5">
        {/* Hero Image Card */}
        <div
          className="mb-4 overflow-hidden rounded-[20px]"
          style={{
            background: 'linear-gradient(135deg, #1E3A8A 0%, #3B82F6 50%, #60A5FA 100%)',
            minHeight: 130,
          }}
        >
          <div className="flex h-full flex-col items-center justify-center p-6 text-center">
            <MaterialIcon name="shield" size={40} className="mb-2 text-white/90" />
            <p className="text-sm font-bold text-white">Protección de Datos</p>
            <p className="text-[11px] text-white/70">Su privacidad es nuestra prioridad</p>
          </div>
        </div>

        {/* Consent Card */}
        <div
          className="mb-4 rounded-[24px] p-6"
          style={{
            backgroundColor: '#FFFFFF',
            boxShadow:
              '0 10px 25px -5px rgba(15,40,100,0.14), 0 8px 10px -6px rgba(15,40,100,0.07)',
          }}
        >
          <div className="mb-4 flex items-center gap-2">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#00288e]/10">
              <MaterialIcon name="description" size={18} className="text-[#00288e]" />
            </div>
            <h3 className="text-sm font-bold text-[#0F172A]">
              Consentimiento para el Seguimiento
            </h3>
          </div>

          <p className="mb-4 text-[12px] leading-relaxed text-[#475569]">
            Por la presente, autorizo al equipo de seguimiento cardiológico de
            CardioCheck a realizar el seguimiento remoto de mi condición
            cardiológica post-alta. Este programa incluye el registro diario de mis síntomas,
            peso y signos vitales a través de esta aplicación.
          </p>

          <p className="mb-4 text-[12px] leading-relaxed text-[#475569]">
            Entiendo que la información proporcionada será utilizada exclusivamente para mi
            cuidado médico y podrá ser compartida con mi equipo de salud tratante. Puedo
            retirar mi consentimiento en cualquier momento sin afectar mi atención médica.
          </p>

          {/* Warning Badge */}
          <div
            className="mb-4 flex items-start gap-2 rounded-xl border p-3"
            style={{
              backgroundColor: '#FEF9C3',
              borderColor: '#CA8A04',
            }}
          >
            <MaterialIcon name="warning" size={18} className="mt-0.5 shrink-0 text-[#CA8A04]" />
            <p className="text-[11px] font-semibold leading-relaxed text-[#713F12]">
              <span className="underline">NO reemplaza la consulta médica</span>. Ante una emergencia, 
              diríjase a la guardia más cercana o llame al 107.
            </p>
          </div>

          {/* Data Protection Note */}
          <div
            className="flex items-start gap-2 rounded-xl border p-3"
            style={{
              backgroundColor: '#F0FDF4',
              borderColor: '#BBF7D0',
            }}
          >
            <MaterialIcon name="verified_user" size={18} className="mt-0.5 shrink-0 text-[#166534]" />
            <p className="text-[11px] leading-relaxed text-[#166534]">
              Sus datos están protegidos conforme a la Ley 25.326 de Protección de Datos
              Personales y solo serán accesibles por su equipo médico.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mb-4 space-y-3">
          <button
            onClick={handleAccept}
            className="flex w-full items-center justify-center gap-2 rounded-2xl px-6 py-3.5 text-sm font-bold text-white transition-all active:scale-[0.97]"
            style={{
              backgroundColor: '#00288e',
              minHeight: 48,
            }}
          >
            Acepto y deseo comenzar
            <MaterialIcon name="check_circle" size={18} />
          </button>

          <button
            onClick={handleDecline}
            className="w-full rounded-2xl px-6 py-3 text-[13px] font-semibold text-[#475569] transition-all active:scale-[0.97]"
            style={{ minHeight: 44 }}
          >
            No estoy de acuerdo
          </button>
        </div>

        {/* Tip Card */}
        <TipCard
          title="Información Útil"
          text="Puede retirar su consentimiento en cualquier momento desde la sección de Ajustes. Su atención médica no se verá afectada de ninguna manera."
          icon="info"
        />
      </main>
    </div>
  )
}
