import test from 'node:test'
import assert from 'node:assert/strict'
import { createHttpClient } from '../src/services/httpTransport.js'

test('authenticated request serializes body and uses Firebase token', async () => {
  const calls = []
  const client = createHttpClient({ baseUrl: 'http://local', tokenProvider: async () => 'token', fetcher: async (...args) => {
    calls.push(args)
    return Response.json({ resposta: 'ok' })
  } })
  assert.deepEqual(await client.json('/chat/', { method: 'POST', body: { pergunta: 'Teste' } }), { resposta: 'ok' })
  assert.equal(calls[0][0], 'http://local/chat/')
  assert.equal(calls[0][1].headers.get('Authorization'), 'Bearer token')
  assert.deepEqual(JSON.parse(calls[0][1].body), { pergunta: 'Teste' })
})

test('public requests do not ask for a token', async () => {
  const client = createHttpClient({ baseUrl: 'http://local', tokenProvider: () => { throw new Error('unexpected') }, fetcher: async (_, options) => {
    assert.equal(options.headers.has('Authorization'), false)
    return Response.json({ equipamentos: [] })
  } })
  await client.json('/public/', { authenticated: false })
})

test('quota error preserves server message and status', async () => {
  const client = createHttpClient({ baseUrl: '', tokenProvider: async () => 'token', fetcher: async () => Response.json({ message: 'Limite diário atingido' }, { status: 429 }) })
  await assert.rejects(client.json('/chat/'), error => error.status === 429 && error.message === 'Limite diário atingido')
})

test('non JSON failure gets a readable message', async () => {
  const client = createHttpClient({ baseUrl: '', fetcher: async () => new Response('gateway failure', { status: 502 }) })
  await assert.rejects(client.json('/public/', { authenticated: false }), /Não foi possível concluir/)
})
