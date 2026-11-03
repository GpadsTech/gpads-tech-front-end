export function createHttpClient({ baseUrl, fetcher = globalThis.fetch, tokenProvider } = {}) {
  async function request(endpoint, { authenticated = true, token, body, headers, ...options } = {}) {
    const requestHeaders = new Headers(headers)
    if (authenticated) requestHeaders.set('Authorization', `Bearer ${token ?? await tokenProvider()}`)
    if (body !== undefined) requestHeaders.set('Content-Type', 'application/json')
    let response
    try {
      response = await fetcher(`${baseUrl}${endpoint}`, {
        ...options, headers: requestHeaders,
        ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
      })
    } catch (error) {
      if (error.name === 'AbortError') throw error
      throw new Error('Não foi possível conectar à API. Verifique sua conexão.')
    }
    if (!response.ok) {
      const data = await response.json().catch(() => ({}))
      const error = new Error(data.message || 'Não foi possível concluir a solicitação.')
      error.status = response.status
      throw error
    }
    return response
  }
  async function json(endpoint, options) {
    return (await request(endpoint, options)).json()
  }
  return { request, json }
}
