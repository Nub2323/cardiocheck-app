import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { verifyAdminPin, unauthorizedResponse } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { pin } = body as { pin: string }

    if (!pin) {
      return NextResponse.json({ valid: false }, { status: 400 })
    }

    const { data, error } = await supabaseAdmin
      .from('admin_pins')
      .select('id')
      .eq('pin', pin)
      .single()

    if (error || !data) {
      return NextResponse.json({ valid: false })
    }

    return NextResponse.json({ valid: true })
  } catch (error) {
    console.error('Error verifying PIN:', error)
    return NextResponse.json({ valid: false }, { status: 500 })
  }
}

// GET - list all PINs (admin only, requires current PIN)
export async function GET(request: NextRequest) {
  if (!await verifyAdminPin(request)) return unauthorizedResponse()

  try {
    const { data: pins, error } = await supabaseAdmin
      .from('admin_pins')
      .select('id, pin, label')

    if (error) throw error

    return NextResponse.json({ pins: pins || [] })
  } catch (error) {
    console.error('Error listing PINs:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

// PUT - update PIN (requires current PIN)
export async function PUT(request: NextRequest) {
  if (!await verifyAdminPin(request)) return unauthorizedResponse()

  try {
    const body = await request.json()
    const { id, newPin, label } = body as { id: string; newPin: string; label?: string }

    if (!id || !newPin) {
      return NextResponse.json({ error: 'id y newPin son requeridos' }, { status: 400 })
    }

    const { data: updated, error } = await supabaseAdmin
      .from('admin_pins')
      .update({ pin: newPin, ...(label ? { label } : {}) })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ pin: updated })
  } catch (error) {
    console.error('Error updating PIN:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
