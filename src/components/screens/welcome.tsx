'use client'

import React from 'react'
import { useAppState } from '@/lib/app-state'
import { AppHeader } from '@/components/app-header'
import { BottomNav } from '@/components/bottom-nav'
import { MaterialIcon } from '@/components/icons'
import { PulseHeartSVG } from '@/components/heart-svg'

export function WelcomeScreen() {
  const { setScreen } = useAppState()

  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader
        icon="monitor_heart"
        title="CardioCheck"
        subtitle="Seguimiento Remoto Cardiológico"
      />

      <main className="flex-1 overflow-y-auto px-4 pb-24 pt-4">
        {/* Hero Section */}
        <div
          className="mb-4 overflow-hidden rounded-[24px] p-6"
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.85) 0%, rgba(255,255,255,0.6) 100%)',
            backdropFilter: 'blur(20px)',
            boxShadow: '0 10px 25px -5px rgba(15,40,100,0.14), 0 8px 10px -6px rgba(15,40,100,0.07)',
          }}
        >
          <div className="mb-3 flex justify-center">
            <PulseHeartSVG size={56} />
          </div>
          <span
            className="mb-3 inline-block rounded-full px-3 py-1 text-[11px] font-bold"
            style={{ backgroundColor: '#DBEAFE', color: '#1E3A8A' }}
          >
Seguimiento Cardiológico Remoto
          </span>
          <h1
            className="mb-2 text-center text-xl font-extrabold leading-tight"
            style={{ color: '#00288e' }}
          >
            Monitoreo Post-Alta Cardíaco
          </h1>
          <p className="mb-5 text-center text-[13px] leading-relaxed text-[#475569]">
            Monitoreo remoto post-alta para pacientes con insuficiencia cardíaca.
            Registro diario de síntomas y seguimiento continuo.
          </p>
          <button
            onClick={() => setScreen('patient-data')}
            className="flex w-full items-center justify-center gap-2 rounded-2xl px-6 py-3.5 text-sm font-bold text-white transition-all active:scale-[0.97]"
            style={{
              backgroundColor: '#00288e',
              minHeight: 48,
            }}
          >
            Empezar
            <MaterialIcon name="arrow_forward" size={18} />
          </button>
        </div>

        {/* Image Card with Glass Effect */}
        <div
          className="mb-4 overflow-hidden rounded-[24px]"
          style={{
            background: 'linear-gradient(135deg, rgba(30,58,138,0.8) 0%, rgba(29,78,216,0.6) 100%)',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 10px 25px -5px rgba(15,40,100,0.14), 0 8px 10px -6px rgba(15,40,100,0.07)',
            minHeight: 120,
          }}
        >
          <div className="flex flex-col items-center justify-center p-6 text-center text-white">
            <MaterialIcon name="monitor_heart" size={36} className="mb-2 text-white/90" />
            <p className="text-sm font-bold">CardioCheck</p>
            <p className="text-[11px] text-white/70">Seguimiento Cardiológico Remoto</p>
          </div>
        </div>

        {/* Urgency Warning */}
        <div
          className="mb-4 rounded-[20px] border-2 p-4"
          style={{
            backgroundColor: '#FEF2F2',
            borderColor: '#FECACA',
          }}
        >
          <div className="mb-2 flex items-center gap-2">
            <MaterialIcon name="warning" size={20} className="text-[#DC2626]" />
            <span className="text-sm font-bold text-[#7F1D1D]">Advertencia de Urgencia</span>
          </div>
          <p className="mb-3 text-[12px] leading-relaxed text-[#7F1D1D]/80">
            Si presenta dolor en el pecho, dificultad severa para respirar o desmayo, diríjase
            inmediatamente a la guardia más cercana. Este sistema NO reemplaza la atención de emergencia.
          </p>
          <button
            onClick={() => window.open('https://www.google.com/maps/search/guardia+hospital+Buenos+Aires', '_blank')}
            className="flex items-center justify-center gap-1.5 rounded-xl px-4 py-2.5 text-[12px] font-bold text-white"
            style={{
              backgroundColor: '#DC2626',
              minHeight: 40,
            }}
          >
            <MaterialIcon name="local_hospital" size={16} />
            Ver Guardias
          </button>
        </div>

        {/* Info Cards */}
        <div className="mb-4 grid grid-cols-1 gap-3">
          {[
            {
              icon: 'monitor_heart',
              title: 'Seguimiento',
              desc: 'Control diario de signos vitales y síntomas cardiológicos',
              color: '#00288e',
              bg: '#EFF6FF',
            },
            {
              icon: 'groups',
              title: 'Pacientes',
              desc: 'Gestión integral del monitoreo de pacientes post-alta',
              color: '#006c4b',
              bg: '#F0FDF4',
            },
            {
              icon: 'lightbulb',
              title: 'Consejos',
              desc: 'Recomendaciones de salud para su recuperación cardíaca',
              color: '#B45309',
              bg: '#FFFBEB',
            },
          ].map((card) => (
            <div
              key={card.title}
              className="flex items-start gap-3 rounded-2xl border p-4"
              style={{
                backgroundColor: card.bg,
                borderColor: '#E2E8F0',
              }}
            >
              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                style={{ backgroundColor: card.color + '15' }}
              >
                <MaterialIcon name={card.icon} size={20} className="" style={{ color: card.color }} />
              </div>
              <div>
                <p className="text-[13px] font-bold" style={{ color: card.color }}>
                  {card.title}
                </p>
                <p className="text-[11px] leading-relaxed text-[#475569]">{card.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Footer Disclaimer */}
        <div className="mt-2 rounded-2xl border border-[#E2E8F0] bg-white/60 p-4">
          <p className="text-center text-[10px] leading-relaxed text-[#94A3B8]">
            ⚕️ Esta aplicación es una herramienta de apoyo y NO reemplaza la consulta médica profesional. No es un servicio oficial de ningún hospital. Ante cualquier emergencia, llame al 107 o concurra a la guardia más cercana.
          </p>
        </div>
      </main>

      <BottomNav
        items={[
          { label: 'Alertas', icon: 'notifications', active: false, onClick: () => setScreen('pin') },
          { label: 'Pacientes', icon: 'groups', active: false, onClick: () => setScreen('pin') },
          { label: 'Inicio', icon: 'home', active: true, onClick: () => setScreen('welcome') },
          { label: 'Historial', icon: 'history', active: false, onClick: () => setScreen('patient-data') },
          { label: 'Equipo', icon: 'medical_services', active: false, onClick: () => setScreen('pin') },
        ]}
      />
    </div>
  )
}
