import { httpClient } from './httpClient.js'
export async function getEquipamentos() {
  return (await httpClient.json('/api/equipamentos/')).equipamentos
}
export function cadastrarEquipamento(nome, identificador, latitude, longitude) {
  return httpClient.json('/api/equipamentos/cadastrar/', { method: 'POST', body: { nome, identificador: Number(identificador), latitude: Number(latitude), longitude: Number(longitude) } })
}
export async function pesquisarLocalizacao(query) {
  return (await httpClient.json(`/api/localizacao/pesquisar/?q=${encodeURIComponent(query)}`)).resultados
}
export function atualizarLocalizacao(identifier, latitude, longitude) {
  return httpClient.json(`/api/equipamentos/${encodeURIComponent(identifier)}/localizacao/`, { method: 'PUT', body: { latitude: Number(latitude), longitude: Number(longitude) } })
}
export function cadastrarUsuario(nome, email, senha) {
  return httpClient.json('/api/usuarios/', { method: 'POST', body: { nome, email, senha } })
}
export async function getEquipamentosPublicos() {
  return (await httpClient.json('/api/equipamentos/publicos/', { authenticated: false })).equipamentos
}
