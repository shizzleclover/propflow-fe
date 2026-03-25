export const Roles = {
  ADMIN: 'ADMIN',
  STAFF: 'STAFF',
  AGENT: 'AGENT',
  CLIENT: 'CLIENT',
} as const

export type Role = (typeof Roles)[keyof typeof Roles]

