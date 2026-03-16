export function canBook(user) {
  return ['student', 'staff', 'admin'].includes(user?.role)
}

export function canCancel(user, reservation) {
  if (!user) return false
  if (user.role === 'admin') return true
  return user.id === reservation.userId &&
    ['pending', 'approved'].includes(reservation.status)
}

export function canManageReservations(user) {
  return user?.role === 'admin'
}

export function canAccessAdmin(user) {
  return user?.role === 'admin'
}

export function canManageSpaces(user) {
  return user?.role === 'admin'
}