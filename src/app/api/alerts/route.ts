import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { verifyAdminPin, unauthorizedResponse } from '@/lib/auth'

export async function GET(request: NextRequest) {
  if (!await verifyAdminPin(request)) return unauthorizedResponse()

  try {
    const { data: alerts, error } = await supabaseAdmin
      .from('alerts')
      .select(`
        *,
        check_ins (
          *,
          check_in_answers (*),
          patients (id, name, dni)
        )
      `)
      .eq('status', 'pending')
      .order('created_at', { ascending: false })

    if (error) throw error

    // Transform to match old format
    const result = (alerts || []).map((alert: Record<string, unknown>) => {
      const checkIn = alert.check_ins as Record<string, unknown> | null
      const patient = checkIn?.patients as Record<string, unknown> | null

      return {
        id: alert.id,
        checkInId: alert.check_in_id,
        status: alert.status,
        createdAt: alert.created_at,
        updatedAt: alert.updated_at,
        checkIn: checkIn ? {
          id: checkIn.id,
          patientId: checkIn.patient_id,
          comment: checkIn.comment,
          severity: checkIn.severity,
          createdAt: checkIn.created_at,
          answers: (checkIn.check_in_answers || []).map((a: Record<string, unknown>) => ({
            id: a.id,
            checkInId: a.check_in_id,
            questionIndex: a.question_index,
            question: a.question,
            answer: a.answer,
            severity: a.severity,
          })),
          patient: patient ? {
            id: patient.id,
            name: patient.name,
            dni: patient.dni,
          } : null,
        } : null,
      }
    })

    return NextResponse.json({ alerts: result })
  } catch (error) {
    console.error('Error listing alerts:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  if (!await verifyAdminPin(request)) return unauthorizedResponse()

  try {
    const body = await request.json()
    const { alertId, status } = body as { alertId: string; status: string }

    if (!alertId || !status) {
      return NextResponse.json({ error: 'alertId y status son requeridos' }, { status: 400 })
    }

    if (!['acknowledged', 'dismissed'].includes(status)) {
      return NextResponse.json({ error: 'Status debe ser "acknowledged" o "dismissed"' }, { status: 400 })
    }

    const { data: alert, error } = await supabaseAdmin
      .from('alerts')
      .update({ status })
      .eq('id', alertId)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ alert })
  } catch (error) {
    console.error('Error updating alert:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
