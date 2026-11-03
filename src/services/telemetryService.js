import { httpClient } from './httpClient.js'

export function getEquipmentData(identifier, { publicAccess = false, signal } = {}) {
  return httpClient.json(`/api/equipamentos/${encodeURIComponent(identifier)}/dados/${publicAccess ? 'publicos/' : ''}`, { authenticated: !publicAccess, signal })
}
export function getEquipmentHistory(identifier, params) {
  const query = params.toString()
  return httpClient.json(`/api/equipamentos/${encodeURIComponent(identifier)}/historico/${query ? `?${query}` : ''}`)
}
