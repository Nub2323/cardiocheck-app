import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { verifyAdminPin, unauthorizedResponse } from '@/lib/auth'

/**
 * GET /api/admin/questions — List ALL questions (including inactive) for admin
 */
export async function GET(request: NextRequest) {
  if (!await verifyAdminPin(request)) return unauthorizedResponse()

  try {
    const { data: questions, error } = await supabaseAdmin
      .from('questions')
      .select('*')
      .order('sort_order', { ascending: true })

    if (error) throw error

    const result = (questions || []).map((q: Record<string, unknown>) => ({
      id: q.id,
      order: q.sort_order,
      emoji: q.emoji,
      question: q.question,
      options: typeof q.options === 'string' ? JSON.parse(q.options) : q.options,
      isActive: q.is_active,
      isCritical: q.is_critical,
      category: q.category,
      createdAt: q.created_at,
      updatedAt: q.updated_at,
    }))

    return NextResponse.json({ questions: result })
  } catch (error) {
    console.error('Error listing questions:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/admin/questions — Create a new question
 */
export async function POST(request: NextRequest) {
  if (!await verifyAdminPin(request)) return unauthorizedResponse()

  try {
    const body = await request.json()
    const { emoji, question, options, isCritical, category, order } = body

    if (!question || !options || options.length === 0) {
      return NextResponse.json(
        { error: 'Pregunta y opciones son requeridas' },
        { status: 400 }
      )
    }

    for (const opt of options) {
      if (!opt.label || !opt.severity) {
        return NextResponse.json(
          { error: 'Cada opción debe tener label y severity' },
          { status: 400 }
        )
      }
    }

    // Get max order if not provided
    let questionOrder = order
    if (questionOrder === undefined || questionOrder === null) {
      const { data: maxQ } = await supabaseAdmin
        .from('questions')
        .select('sort_order')
        .order('sort_order', { ascending: false })
        .limit(1)
        .single()

      questionOrder = (maxQ?.sort_order ?? -1) + 1
    }

    const { data: newQuestion, error } = await supabaseAdmin
      .from('questions')
      .insert({
        emoji: emoji || '❓',
        question,
        options,
        is_critical: isCritical || false,
        category: category || 'general',
        sort_order: questionOrder,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({
      question: {
        id: newQuestion.id,
        order: newQuestion.sort_order,
        emoji: newQuestion.emoji,
        question: newQuestion.question,
        options: typeof newQuestion.options === 'string' ? JSON.parse(newQuestion.options) : newQuestion.options,
        isActive: newQuestion.is_active,
        isCritical: newQuestion.is_critical,
        category: newQuestion.category,
        createdAt: newQuestion.created_at,
        updatedAt: newQuestion.updated_at,
      },
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating question:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/admin/questions — Update a question
 */
export async function PUT(request: NextRequest) {
  if (!await verifyAdminPin(request)) return unauthorizedResponse()

  try {
    const body = await request.json()
    const { id, ...updates } = body

    if (!id) {
      return NextResponse.json(
        { error: 'ID es requerido' },
        { status: 400 }
      )
    }

    const data: Record<string, unknown> = {}
    if (updates.emoji !== undefined) data.emoji = updates.emoji
    if (updates.question !== undefined) data.question = updates.question
    if (updates.isCritical !== undefined) data.is_critical = updates.isCritical
    if (updates.category !== undefined) data.category = updates.category
    if (updates.order !== undefined) data.sort_order = updates.order
    if (updates.isActive !== undefined) data.is_active = updates.isActive
    if (updates.options !== undefined) {
      for (const opt of updates.options) {
        if (!opt.label || !opt.severity) {
          return NextResponse.json(
            { error: 'Cada opción debe tener label y severity' },
            { status: 400 }
          )
        }
      }
      data.options = updates.options
    }

    const { data: question, error } = await supabaseAdmin
      .from('questions')
      .update(data)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({
      question: {
        id: question.id,
        order: question.sort_order,
        emoji: question.emoji,
        question: question.question,
        options: typeof question.options === 'string' ? JSON.parse(question.options) : question.options,
        isActive: question.is_active,
        isCritical: question.is_critical,
        category: question.category,
        createdAt: question.created_at,
        updatedAt: question.updated_at,
      },
    })
  } catch (error) {
    console.error('Error updating question:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/admin/questions — Delete a question
 */
export async function DELETE(request: NextRequest) {
  if (!await verifyAdminPin(request)) return unauthorizedResponse()

  try {
    const body = await request.json()
    const { id } = body

    if (!id) {
      return NextResponse.json(
        { error: 'ID es requerido' },
        { status: 400 }
      )
    }

    const { error } = await supabaseAdmin
      .from('questions')
      .delete()
      .eq('id', id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting question:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
