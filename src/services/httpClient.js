import { API_URL } from './config.js'
import { getIdToken } from '../auth.js'
import { createHttpClient } from './httpTransport.js'

export const httpClient = createHttpClient({ baseUrl: API_URL, tokenProvider: getIdToken })
