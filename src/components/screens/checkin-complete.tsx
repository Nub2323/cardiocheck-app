'use client'

import React from 'react'
import { useAppState } from '@/lib/app-state'
import { AppHeader } from '@/components/app-header'
import { MaterialIcon } from '@/components/icons'
import { TipCard } from '@/components/tip-card'

export function CheckinCompleteScreen() {
  const { patientName, setScreen, resetFlow } = useAppState()

  const handleGoHome = () => {
    resetFlow()
    setScreen('welcome')
  }

  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader
        icon="monitor_heart"
        title="Unidad de Cuidados Cardiológicos"
        subtitle="CardioCheck"
      />

      <main className="flex flex-1 flex-col items-center justify-center px-6 pb-8">
        {/* Success Icon */}
        <div
          className="mb-5 flex h-20 w-20 items-center justify-center rounded-full"
          style={{ backgroundColor: '#DCFCE7' }}
        >
          <MaterialIcon name="check_circle" size={44} className="text-[#16A34A]" />
        </div>

        <h2 className="mb-2 text-center text-lg font-extrabold text-[#0F172A]">
          ¡Registro Completado!
        </h2>

        <p className="mb-6 text-center text-[13px] leading-relaxed text-[#475569]">
          {patientName
            ? `${patientName}, su`
            : 'Su'}{' '}
          registro diario ha sido enviado exitosamente al equipo de seguimiento cardiológico.
          Se le notificará si se requiere alguna acción.
        </p>

        {/* Summary Card */}
        <div
          className="mb-6 w-full rounded-[24px] p-6"
          style={{
            backgroundColor: '#FFFFFF',
            boxShadow:
              '0 10px 25px -5px rgba(15,40,100,0.14), 0 8px 10px -6px rgba(15,40,100,0.07)',
          }}
        >
          <div className="mb-3 flex items-center gap-2">
            <MaterialIcon name="schedule" size={18} className="text-[#00288e]" />
            <span className="text-[13px] font-bold text-[#0F172A]">Próximo check-in</span>
          </div>
          <p className="text-[12px] text-[#475569]">
            Recuerde realizar su registro diario entre las <strong>8:00 y 11:00 hs</strong>.
            La constancia en el seguimiento es clave para su recuperación.
          </p>
        </div>

        {/* Action Button */}
        <button
          onClick={handleGoHome}
          className="mb-5 flex w-full items-center justify-center gap-2 rounded-2xl px-6 py-3.5 text-sm font-bold text-white transition-all active:scale-[0.97]"
          style={{
            backgroundColor: '#00288e',
            minHeight: 48,
          }}
        >
          <MaterialIcon name="home" size={18} />
          Volver al Inicio
        </button>

        {/* Tip Card */}
        <TipCard
          title="Consejo de Salud"
          text="Recuerde tomar su medicación según las indicaciones de su médico. Si nota algún cambio en sus síntomas, no espere al próximo check-in para contactar a su equipo."
          icon="verified_user"
        />
      </main>
    </div>
  )
}
