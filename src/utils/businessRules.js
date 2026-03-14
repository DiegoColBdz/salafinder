export function isUserBlocked(user) {
  if (!user.blockedUntil) return false;
  return new Date() < new Date(user.blockedUntil);
}

export function getBlockedDaysLeft(user) {
  if (!user.blockedUntil) return 0;
  const diff = new Date(user.blockedUntil) - new Date();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function hasTimeConflict(
  reservations,
  spaceId,
  date,
  startTime,
  endTime,
  excludeId = null,
) {
  return (
    reservations.find(
      (r) =>
        r.id !== excludeId &&
        r.spaceId === spaceId &&
        r.date === date &&
        r.status === "approved" &&
        startTime < r.endTime &&
        endTime > r.startTime,
    ) || null
  );
}

export function getAlternativeSlots(reservations, spaceId, date) {
  const dayRes = reservations
    .filter(
      (r) =>
        r.spaceId === spaceId && r.date === date && r.status === "approved",
    )
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  const alternatives = [];
  let cursor = "07:00";

  dayRes.forEach((r) => {
    if (cursor < r.startTime)
      alternatives.push({ startTime: cursor, endTime: r.startTime });
    cursor = r.endTime;
  });
  if (cursor < "22:00")
    alternatives.push({ startTime: cursor, endTime: "22:00" });

  return alternatives.slice(0, 3);
}

export function isProgramAllowed(space, userProgram) {
  if (!space.allowedPrograms || space.allowedPrograms.length === 0) return true;
  if (!userProgram) return false;
  return space.allowedPrograms.includes(userProgram);
}

export function getActiveReservationsCount(reservations, userId) {
  return reservations.filter(
    (r) => r.userId === userId && ["pending", "approved"].includes(r.status),
  ).length;
}

export const MAX_ACTIVE_RESERVATIONS = 3;

export function isTooSoon(date, startTime) {
  const reservationDate = new Date(`${date}T${startTime}:00`);
  const now = new Date();
  const diffMs = reservationDate - now;
  return diffMs < 60 * 60 * 1000; // menos de 1 hora
}
