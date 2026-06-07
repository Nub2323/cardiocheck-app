import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { verifyAdminPin, unauthorizedResponse } from '@/lib/auth'

/**
 * POST /api/admin/patients — Register a new patient (admin only).
 */
export async function POST(request: NextRequest) {
  if (!await verifyAdminPin(request)) return unauthorizedResponse()

  try {
    const body = await request.json()
    const { name, dni, birthDate } = body

    if (!name || !dni) {
      return NextResponse.json(
        { error: 'Nombre y DNI son requeridos' },
        { status: 400 }
      )
    }

    const dniDigits = dni.replace(/\D/g, '')
    if (dniDigits.length < 7 || dniDigits.length > 8) {
      return NextResponse.json(
        { error: 'El DNI debe tener entre 7 y 8 dígitos' },
        { status: 400 }
      )
    }

    // Check if patient already exists
    const { data: existing } = await supabaseAdmin
      .from('patients')
      .select('id, name')
      .eq('dni', dniDigits)
      .single()

    if (existing) {
      return NextResponse.json(
        { error: `Ya existe un paciente con DNI ${dniDigits}: ${existing.name}` },
        { status: 409 }
      )
    }

    // Create patient
    const { data: patient, error } = await supabaseAdmin
      .from('patients')
      .insert({
        name: name.trim(),
        dni: dniDigits,
        birth_date: birthDate || null,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({
      patient: {
        id: patient.id,
        name: patient.name,
        dni: patient.dni,
        birthDate: patient.birth_date,
        createdAt: patient.created_at,
      },
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating patient:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/admin/patients — Remove a patient (admin only).
 */
export async function DELETE(request: NextRequest) {
  if (!await verifyAdminPin(request)) return unauthorizedResponse()

  try {
    const body = await request.json()
    const { patientId } = body

    if (!patientId) {
      return NextResponse.json(
        { error: 'patientId es requerido' },
        { status: 400 }
      )
    }

    const { error } = await supabaseAdmin
      .from('patients')
      .delete()
      .eq('id', patientId)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting patient:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
