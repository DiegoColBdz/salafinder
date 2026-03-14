const BASE_URL = 'http://localhost:3001'

// ─── Spaces ───────────────────────────────────────────────────────────────────

export async function getSpaces() {
  const res = await fetch(`${BASE_URL}/spaces`)
  if (!res.ok) throw new Error('Error al cargar los espacios')
  return res.json()
}

export async function getSpaceById(id) {
  const res = await fetch(`${BASE_URL}/spaces/${id}`)
  if (!res.ok) throw new Error('Espacio no encontrado')
  return res.json()
}

// ─── Reservations ─────────────────────────────────────────────────────────────

export async function getReservations() {
  const res = await fetch(`${BASE_URL}/reservations`)
  if (!res.ok) throw new Error('Error al cargar las reservas')
  return res.json()
}

export async function createReservation(data) {
  const res = await fetch(`${BASE_URL}/reservations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('Error al crear la reserva')
  return res.json()
}

export async function updateReservation(id, data) {
  const res = await fetch(`${BASE_URL}/reservations/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('Error al actualizar la reserva')
  return res.json()
}

// ─── Users ────────────────────────────────────────────────────────────────────

export async function getUsers() {
  const res = await fetch(`${BASE_URL}/users`)
  if (!res.ok) throw new Error('Error al cargar los usuarios')
  return res.json()
}

export async function getUserByEmail(email) {
  const res = await fetch(`${BASE_URL}/users?email=${email}`)
  if (!res.ok) throw new Error('Error al buscar usuario')
  const users = await res.json()
  return users[0] || null
}

export async function createUser(data) {
  const res = await fetch(`${BASE_URL}/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('Error al crear el usuario')
  return res.json()
}

export async function updateUser(id, data) {
  const res = await fetch(`${BASE_URL}/users/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('Error al actualizar el usuario')
  return res.json()
}