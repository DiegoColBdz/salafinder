export const SPACES = [
  {
    id: 'sp-01',
    name: 'Laboratorio de Cómputo A',
    type: 'laboratorio',
    capacity: 30,
    building: 'Bloque 7',
    resources: ['proyector', 'computadores', 'aire acondicionado'],
    allowedPrograms: ['Ingeniería de Sistemas', 'Ingeniería Web'],
    requiresApproval: false,
    description: 'Laboratorio con 30 computadores de alto rendimiento.',
  },
  {
    id: 'sp-02',
    name: 'Sala de Reuniones 201',
    type: 'sala',
    capacity: 12,
    building: 'Bloque 2',
    resources: ['proyector', 'videoconferencia', 'pizarrón'],
    allowedPrograms: [],
    requiresApproval: true,
    description: 'Sala ejecutiva para reuniones pequeñas y videoconferencias.',
  },
  {
    id: 'sp-03',
    name: 'Cancha Múltiple Norte',
    type: 'cancha',
    capacity: 20,
    building: 'Zona Deportiva',
    resources: ['balones', 'iluminación nocturna'],
    allowedPrograms: [],
    requiresApproval: false,
    description: 'Cancha polideportiva con superficie sintética.',
  },
  {
    id: 'sp-04',
    name: 'Auditorio Principal',
    type: 'auditorio',
    capacity: 200,
    building: 'Bloque Central',
    resources: ['proyector HD', 'sistema de sonido', 'aire acondicionado'],
    allowedPrograms: [],
    requiresApproval: true,
    description: 'Auditorio para 200 personas, ideal para eventos y conferencias.',
  },
  {
    id: 'sp-05',
    name: 'Laboratorio de Electrónica',
    type: 'laboratorio',
    capacity: 24,
    building: 'Bloque 4',
    resources: ['osciloscopios', 'fuentes de poder', 'multímetros'],
    allowedPrograms: ['Ingeniería Electrónica'],
    requiresApproval: false,
    description: 'Laboratorio con equipos de instrumentación electrónica.',
  },
  {
    id: 'sp-06',
    name: 'Sala de Estudio Grupal B',
    type: 'sala',
    capacity: 8,
    building: 'Biblioteca',
    resources: ['pizarrón', 'TV 55"'],
    allowedPrograms: [],
    requiresApproval: false,
    description: 'Sala silenciosa para grupos de estudio pequeños.',
  },
]

function getTodayStr() {
  return new Date().toISOString().split('T')[0]
}
function getTomorrowStr() {
  const d = new Date()
  d.setDate(d.getDate() + 1)
  return d.toISOString().split('T')[0]
}

export const RESERVATIONS_INITIAL = [
  { id: 'res-001', spaceId: 'sp-01', userId: 'u-002', date: getTodayStr(), startTime: '08:00', endTime: '10:00', purpose: 'Clase práctica de programación web', attendeeCount: 25, status: 'approved', createdAt: new Date().toISOString() },
  { id: 'res-002', spaceId: 'sp-02', userId: 'u-003', date: getTodayStr(), startTime: '14:00', endTime: '15:30', purpose: 'Reunión de proyecto de grado', attendeeCount: 6, status: 'pending', createdAt: new Date().toISOString() },
  { id: 'res-003', spaceId: 'sp-03', userId: 'u-001', date: getTomorrowStr(), startTime: '16:00', endTime: '18:00', purpose: 'Entrenamiento de fútbol', attendeeCount: 14, status: 'approved', createdAt: new Date().toISOString() },
]

export const USERS_INITIAL = [
  { id: 'u-001', name: 'Ana García', email: 'ana.garcia@uni.edu', password: '123456', role: 'student', noShows: 0, blockedUntil: null },
  { id: 'u-002', name: 'Carlos Mora', email: 'carlos.mora@uni.edu', password: '123456', role: 'staff', noShows: 0, blockedUntil: null },
  { id: 'u-003', name: 'Admin Sistema', email: 'admin@uni.edu', password: 'admin123', role: 'admin', noShows: 0, blockedUntil: null },
]

export const SPACE_TYPES = ['laboratorio', 'sala', 'cancha', 'auditorio']