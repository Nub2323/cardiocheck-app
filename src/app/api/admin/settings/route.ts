import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { verifyAdminPin, unauthorizedResponse } from '@/lib/auth'

// GET — list all settings (admin only)
export async function GET(request: NextRequest) {
  if (!await verifyAdminPin(request)) return unauthorizedResponse()

  try {
    const { data: settings, error } = await supabaseAdmin
      .from('app_settings')
      .select('*')

    if (error) throw error

    return NextResponse.json({ settings: settings || [] })
  } catch (error) {
    console.error('Error fetching settings:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

// PUT — update a setting (admin only)
export async function PUT(request: NextRequest) {
  if (!await verifyAdminPin(request)) return unauthorizedResponse()

  try {
    const body = await request.json()
    const { key, value } = body as { key: string; value: string }

    if (!key || value === undefined) {
      return NextResponse.json({ error: 'key y value son requeridos' }, { status: 400 })
    }

    // Use upsert
    const { data: existing } = await supabaseAdmin
      .from('app_settings')
      .select('key')
      .eq('key', key)
      .single()

    let result
    if (existing) {
      const { data, error } = await supabaseAdmin
        .from('app_settings')
        .update({ value })
        .eq('key', key)
        .select()
        .single()
      if (error) throw error
      result = data
    } else {
      const { data, error } = await supabaseAdmin
        .from('app_settings')
        .insert({ key, value, label: key })
        .select()
        .single()
      if (error) throw error
      result = data
    }

    return NextResponse.json({ setting: result })
  } catch (error) {
    console.error('Error updating setting:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
