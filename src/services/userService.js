import { httpClient } from './httpClient.js'
export async function getCurrentUserProfile(token) {
  return (await httpClient.json('/api/auth/me/', { token })).usuario
}
