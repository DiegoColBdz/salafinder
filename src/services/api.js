import {
  SPACES,
  USERS_INITIAL,
  RESERVATIONS_INITIAL,
} from '../data/mockData'

const BASE_URL = 'http://localhost:3001'
const TIMEOUT  = 2000 // 2 segundos para detectar que no hay servidor

// Helper — fetch con timeout
async function fetchWithTimeout(url, options = {}) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT)
  try {
    const res = await fetch(url, { ...options, signal: controller.signal })
    clearTimeout(timer)
    return res
  } catch {
    clearTimeout(timer)
    throw new Error('OFFLINE')
  }
}

//  Spaces 

export async function getSpaces() {
  try {
    const res = await fetchWithTimeout(`${BASE_URL}/spaces`)
    if (!res.ok) throw new Error()
    return res.json()
  } catch {
    console.warn('JSON Server no disponible — usando mockData para spaces')
    return SPACES
  }
}

export async function getSpaceById(id) {
  try {
    const res = await fetchWithTimeout(`${BASE_URL}/spaces/${id}`)
    if (!res.ok) throw new Error()
    return res.json()
  } catch {
    return SPACES.find(s => s.id === id) || null
  }
}

export async function createSpace(data) {
  try {
    const res = await fetchWithTimeout(`${BASE_URL}/spaces`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!res.ok) throw new Error()
    return res.json()
  } catch {
    return { ...data, id: `sp-${Date.now()}` }
  }
}

export async function updateSpace(id, data) {
  try {
    const res = await fetchWithTimeout(`${BASE_URL}/spaces/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!res.ok) throw new Error()
    return res.json()
  } catch {
    return { id, ...data }
  }
}

export async function deleteSpace(id) {
  try {
    const res = await fetchWithTimeout(`${BASE_URL}/spaces/${id}`, { method: 'DELETE' })
    if (!res.ok) throw new Error()
    return true
  } catch {
    return true
  }
}

//  Reservations

export async function getReservations() {
  try {
    const res = await fetchWithTimeout(`${BASE_URL}/reservations`)
    if (!res.ok) throw new Error()
    return res.json()
  } catch {
    console.warn('JSON Server no disponible — usando mockData para reservations')
    const stored = localStorage.getItem('sf_reservations')
    return stored ? JSON.parse(stored) : RESERVATIONS_INITIAL
  }
}

export async function createReservation(data) {
  try {
    const res = await fetchWithTimeout(`${BASE_URL}/reservations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!res.ok) throw new Error()
    return res.json()
  } catch {
    // Sin servidor — guarda en localStorage
    const newRes = { ...data, id: `res-${Date.now()}` }
    const stored = localStorage.getItem('sf_reservations')
    const all    = stored ? JSON.parse(stored) : RESERVATIONS_INITIAL
    localStorage.setItem('sf_reservations', JSON.stringify([...all, newRes]))
    return newRes
  }
}

export async function updateReservation(id, data) {
  try {
    const res = await fetchWithTimeout(`${BASE_URL}/reservations/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!res.ok) throw new Error()
    return res.json()
  } catch {
    const stored = localStorage.getItem('sf_reservations')
    const all    = stored ? JSON.parse(stored) : []
    const updated = all.map(r => r.id === id ? { ...r, ...data } : r)
    localStorage.setItem('sf_reservations', JSON.stringify(updated))
    return { id, ...data }
  }
}

//  Users 

export async function getUsers() {
  try {
    const res = await fetchWithTimeout(`${BASE_URL}/users`)
    if (!res.ok) throw new Error()
    return res.json()
  } catch {
    const stored = localStorage.getItem('sf_users')
    return stored ? JSON.parse(stored) : USERS_INITIAL
  }
}

export async function getUserByEmail(email) {
  try {
    const res = await fetchWithTimeout(`${BASE_URL}/users?email=${email}`)
    if (!res.ok) throw new Error()
    const users = await res.json()
    return users[0] || null
  } catch {
    const stored = localStorage.getItem('sf_users')
    const users  = stored ? JSON.parse(stored) : USERS_INITIAL
    return users.find(u => u.email === email) || null
  }
}

export async function createUser(data) {
  try {
    const res = await fetchWithTimeout(`${BASE_URL}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!res.ok) throw new Error()
    return res.json()
  } catch {
    const stored = localStorage.getItem('sf_users')
    const users  = stored ? JSON.parse(stored) : USERS_INITIAL
    localStorage.setItem('sf_users', JSON.stringify([...users, data]))
    return data
  }
}

export async function updateUser(id, data) {
  try {
    const res = await fetchWithTimeout(`${BASE_URL}/users/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!res.ok) throw new Error()
    return res.json()
  } catch {
    return { id, ...data }
  }
}