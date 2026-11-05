// Utilitários manuais: não são executados na inicialização da aplicação.
import { login } from './auth.js'
import { getEquipmentHistory } from './services/telemetryService.js'
import { httpClient } from './services/httpClient.js'

export async function testAuthentication(email, password, identifier, start, end) {
  await login(email, password)
  const params = new URLSearchParams()
  if (start) params.set('inicio', start)
  if (end) params.set('fim', end)
  return getEquipmentHistory(identifier, params)
}

export function testNovaLocalizacao(identifier, latitude, longitude) {
  return httpClient.json(`/api/equipamentos/${encodeURIComponent(identifier)}/localizacoes/`, {
    method: 'POST', body: { latitude, longitude },
  })
}
