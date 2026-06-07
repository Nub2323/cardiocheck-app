import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const alerts = await db.alert.findMany({
      where: { status: 'pending' },
      orderBy: { createdAt: 'desc' },
      include: {
        checkIn: {
          include: {
            patient: {
              select: { id: true, name: true, dni: true },
            },
            answers: true,
          },
        },
      },
    })

    return NextResponse.json({ alerts })
  } catch (error) {
    console.error('Error listing alerts:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { alertId, status } = body as { alertId: string; status: string }

    if (!alertId || !status) {
      return NextResponse.json({ error: 'alertId y status son requeridos' }, { status: 400 })
    }

    if (!['acknowledged', 'dismissed'].includes(status)) {
      return NextResponse.json({ error: 'Status debe ser "acknowledged" o "dismissed"' }, { status: 400 })
    }

    const alert = await db.alert.update({
      where: { id: alertId },
      data: { status },
    })

    return NextResponse.json({ alert })
  } catch (error) {
    console.error('Error updating alert:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
