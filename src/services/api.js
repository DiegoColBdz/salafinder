const BASE_URL = 'https://localhost:7291' // Cambia por tu puerto del backend

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getToken() {
  return sessionStorage.getItem('authTokenJWT')
}

function authHeaders() {
  const token = getToken()
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

async function handleResponse(res) {
  const data = await res.json()
  if (!res.ok) throw new Error(data.message || 'Error en el servidor')
  return data
}



// ─── Spaces ───────────────────────────────────────────────────────────────────

export async function getSpaces() {
  const res = await fetch(`${BASE_URL}/espacio`, {
    headers: authHeaders(),
  })
  return handleResponse(res)
}

export async function getSpaceById(id) {
  const res = await fetch(`${BASE_URL}/espacio/${id}`, {
    headers: authHeaders(),
  })
  return handleResponse(res)
}

export async function createSpace(data) {
  const res = await fetch(`${BASE_URL}/espacio`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({
      nombre:                data.nombre,
      tipo:                  data.tipo,
      capacidad:             data.capacidad,
      edificio:              data.edificio,
      descripcion:           data.descripcion,
      recursos:              data.recursos,
      programas_prioritarios: data.programas_prioritarios,
      requiere_aprobacion:   data.requiere_aprobacion,
    }),
  })
  return handleResponse(res)
}

export async function updateSpace(id, data) {
  // El backend recibe el id como query param: PUT /espacio?id=xxx
  const res = await fetch(`${BASE_URL}/espacio?id=${id}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify({
      nombre:                data.nombre,
      tipo:                  data.tipo,
      capacidad:             data.capacidad,
      edificio:              data.edificio,
      descripcion:           data.descripcion,
      recursos:              data.recursos,
      programas_prioritarios: data.programas_prioritarios,
      requiere_aprobacion:   data.requiere_aprobacion,
    }),
  })
  return handleResponse(res)
}

export async function deleteSpace(id) {
  // El backend recibe el id en el body: DELETE /espacio
  const res = await fetch(`${BASE_URL}/espacio`, {
    method: 'DELETE',
    headers: authHeaders(),
    body: JSON.stringify({ id }),
  })
  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'Error al eliminar.' }))
    throw new Error(error.message)
  }
  return true
}

// ─── Reservations ─────────────────────────────────────────────────────────────

export async function getReservations() {
  const res = await fetch(`${BASE_URL}/reserva`, {
    headers: authHeaders(),
  })
  return handleResponse(res)
}

export async function createReservation(data) {
  const res = await fetch(`${BASE_URL}/reserva`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({
      id_espacio:  data.spaceId,
      fecha:       data.date,
      hora_inicio: data.startTime + ':00', // Aseguramos formato HH:mm:ss
      hora_fin:    data.endTime + ':00', // Aseguramos formato HH:mm:ss
      proposito:   data.purpose,
      asistentes:  data.attendeeCount,
    }),
  })
  return handleResponse(res)
}

export async function updateReservation(id, data) {
  // PUT /reserva/{id} → cambia estado (Admin)
  const res = await fetch(`${BASE_URL}/reserva/${id}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify({ estado: data.estado }),
  })
  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'Error al actualizar.' }))
    throw new Error(error.message)
  }
  return true
}

export async function cancelReservation(id) {
  const res = await fetch(`${BASE_URL}/reserva/cancel`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify({ id: id }),
  })
  if (!res.ok) {
    const data = await res.json()
    throw new Error(data.message || 'Error al cancelar la reserva.')
  }
  return true
}

// ─── Users (Admin) ────────────────────────────────────────────────────────────

export async function getUsers() {
  const res = await fetch(`${BASE_URL}/usuarioperfil`, {
    headers: authHeaders(),
  })
  return handleResponse(res)
}

export async function cambiarRol(usuario_perfil_id, nuevo_rol) {
  const res = await fetch(`${BASE_URL}/auth/cambiar-rol`, {
    method: 'PATCH',
    headers: authHeaders(),
    body: JSON.stringify({ usuario_perfil_id, nuevo_rol }),
  })
  return handleResponse(res)
}