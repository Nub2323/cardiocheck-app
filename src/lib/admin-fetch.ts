/**
 * Helper for making authenticated admin API calls.
 * Automatically includes the admin PIN in request headers.
 */

export function createAdminFetch(getPin: () => string) {
  return async function adminFetch(
    url: string,
    options: RequestInit = {}
  ): Promise<Response> {
    const pin = getPin()
    const headers = new Headers(options.headers || {})
    headers.set('x-admin-pin', pin)
    headers.set('Content-Type', 'application/json')

    return fetch(url, {
      ...options,
      headers,
    })
  }
}
