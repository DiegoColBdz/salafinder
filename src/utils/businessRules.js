export function isUserBlocked(user) {
  if (!user?.blockedUntil) return false;
  return new Date() < new Date(user.blockedUntil);
}

export function getBlockedDaysLeft(user) {
  if (!user?.blockedUntil) return 0;
  const diff = new Date(user.blockedUntil) - new Date();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

// Compara horas "HH:mm" o "HH:mm:ss" de forma segura
function normalizeHora(h) {
  if (!h) return "";
  return h.length === 5 ? h + ":00" : h;
}

export function hasTimeConflict(
  reservations,
  spaceId,
  fecha,
  horaInicio,
  horaFin,
  excludeId = null,
) {
  const hi = normalizeHora(horaInicio);
  const hf = normalizeHora(horaFin);
  const found = reservations.find(
    (r) =>
      r.id !== excludeId &&
      r.id_espacio === spaceId &&
      r.fecha === fecha &&
      (r.estado === "Aprobado" || r.estado === "Pendiente") &&
      normalizeHora(r.hora_inicio) < hf &&
      normalizeHora(r.hora_fin) > hi,
  );
  if (!found) return null;
  // Devolvemos las claves en inglés que espera el banner UI
  return {
    startTime: normalizeHora(found.hora_inicio).slice(0, 5),
    endTime: normalizeHora(found.hora_fin).slice(0, 5),
  };
}

export function getAlternativeSlots(reservations, spaceId, fecha) {
  const dayRes = reservations
    .filter(
      (r) =>
        r.id_espacio === spaceId &&
        r.fecha === fecha &&
        (r.estado === "Aprobado" || r.estado === "Pendiente"),
    )
    .map((r) => ({
      hora_inicio: normalizeHora(r.hora_inicio).slice(0, 5),
      hora_fin: normalizeHora(r.hora_fin).slice(0, 5),
    }))
    .sort((a, b) => a.hora_inicio.localeCompare(b.hora_inicio));

  const alternatives = [];
  let cursor = "07:00";
  dayRes.forEach((r) => {
    if (cursor < r.hora_inicio)
      alternatives.push({ startTime: cursor, endTime: r.hora_inicio });
    cursor = r.hora_fin;
  });
  if (cursor < "22:00")
    alternatives.push({ startTime: cursor, endTime: "22:00" });

  return alternatives.slice(0, 3);
}

export function getActiveReservationsCount(reservations, userId) {
  return reservations.filter(
    (r) =>
      r.id_usuario === userId &&
      (r.estado === "Pendiente" || r.estado === "Aprobado"),
  ).length;
}

export const MAX_ACTIVE_RESERVATIONS = 3;

export function isTooSoon(fecha, horaInicio) {
  const reservationDate = new Date(`${fecha}T${normalizeHora(horaInicio)}`);
  const diffMs = reservationDate - new Date();
  return diffMs < 60 * 60 * 1000;
}
