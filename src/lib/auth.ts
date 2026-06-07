import { supabaseAdmin } from '@/lib/supabase'

/**
 * Verify admin PIN from request headers or body.
 * Returns true if the PIN is valid, false otherwise.
 * 
 * Accepts PIN via:
 * - Header: x-admin-pin
 * - Body field: adminPin
 */
export async function verifyAdminPin(request: Request): Promise<boolean> {
  let pin: string | undefined

  // Try header first
  pin = request.headers.get('x-admin-pin') || undefined

  // Fallback to body field
  if (!pin) {
    try {
      const body = await request.clone().json()
      pin = body.adminPin
    } catch {
      // No body or invalid JSON
    }
  }

  if (!pin) return false

  const { data, error } = await supabaseAdmin
    .from('admin_pins')
    .select('id')
    .eq('pin', pin)
    .single()

  return !error && !!data
}

/**
 * Create an unauthorized response
 */
export function unauthorizedResponse() {
  return new Response(
    JSON.stringify({ error: 'PIN de administrador requerido' }),
    { 
      status: 401, 
      headers: { 'Content-Type': 'application/json' } 
    }
  )
}
