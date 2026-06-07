import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

/**
 * POST /api/admin/patients — Register a new patient (admin only).
 * This is the ONLY way to create patients.
 * Body: { name, dni, birthDate (YYYY-MM-DD) }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, dni, birthDate } = body

    if (!name || !dni) {
      return NextResponse.json(
        { error: 'Nombre y DNI son requeridos' },
        { status: 400 }
      )
    }

    // Validate DNI format
    const dniDigits = dni.replace(/\D/g, '')
    if (dniDigits.length < 7 || dniDigits.length > 8) {
      return NextResponse.json(
        { error: 'El DNI debe tener entre 7 y 8 dígitos' },
        { status: 400 }
      )
    }

    // Check if patient already exists
    const existing = await db.patient.findUnique({ where: { dni: dniDigits } })
    if (existing) {
      return NextResponse.json(
        { error: `Ya existe un paciente con DNI ${dniDigits}: ${existing.name}` },
        { status: 409 }
      )
    }

    // Create patient
    const patient = await db.patient.create({
      data: {
        name: name.trim(),
        dni: dniDigits,
        birthDate: birthDate ? new Date(birthDate) : null,
      },
    })

    return NextResponse.json({ patient }, { status: 201 })
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
 * Body: { patientId }
 */
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json()
    const { patientId } = body

    if (!patientId) {
      return NextResponse.json(
        { error: 'patientId es requerido' },
        { status: 400 }
      )
    }

    await db.patient.delete({ where: { id: patientId } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting patient:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
