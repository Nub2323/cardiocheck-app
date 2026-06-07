import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { pin } = body as { pin: string }

    if (!pin) {
      return NextResponse.json({ valid: false }, { status: 400 })
    }

    const found = await db.adminPin.findUnique({ where: { pin } })

    return NextResponse.json({ valid: !!found })
  } catch (error) {
    console.error('Error verifying PIN:', error)
    return NextResponse.json({ valid: false }, { status: 500 })
  }
}
