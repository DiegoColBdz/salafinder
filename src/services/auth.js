const BASE_URL = "https://localhost:7291"; // Cambia por tu puerto del backend

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getToken() {
  return sessionStorage.getItem("authTokenJWT");
}

function authHeaders() {
  const token = getToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function handleResponse(res) {
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Error en el servidor");
  return data;
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export async function loginApi(email, password) {
  const res = await fetch(`${BASE_URL}/Auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await handleResponse(res);

  // Guardar token en sessionStorage
  sessionStorage.setItem("authTokenJWT", data.token);

  return data; // { token, email, nombre_completo, rol, usuario_perfil_id, expira_en }
}

export async function registerApi(nombre_completo, email, password) {
  const res = await fetch(`${BASE_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nombre_completo, email, password }),
  });
  const data = await handleResponse(res);

  // Guardar token en sessionStorage
  sessionStorage.setItem("authTokenJWT", data.token);

  return data;
}

export function logoutApi() {
  // Remover token al hacer logout
  sessionStorage.removeItem("authTokenJWT");
}

// Decodifica el payload del JWT actual (sin validar firma — solo lectura)
export function getCurrentUserFromToken() {
  const token = sessionStorage.getItem("authTokenJWT");
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return {
      id: payload.usuario_perfil_id,
      name: payload.nombre_completo,
      email: payload.email,
      role: (
        payload.role ||
        payload[
          "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
        ] ||
        "Student"
      ).toLowerCase(),
    };
  } catch {
    return null;
  }
}

