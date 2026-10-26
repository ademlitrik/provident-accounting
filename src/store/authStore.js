import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const DEFAULT_ADMIN = {
  id: 'user-admin-001',
  name: 'Provident Administrator',
  email: 'info@pfconsultants.co.za',
  password: 'admin@123',
  role: 'Senior Audit Partner',
  isAdmin: true,
  createdAt: new Date().toISOString(),
}

export const useAuthStore = create(
  persist(
    (set, get) => ({
      isLoggedIn: false,
      user: null,
      firm: {
        name: 'Provident Accounting & Advisory (Pty) Ltd',
        logo: null,
        currency: 'ZAR (R)',
        fiscalYearEnd: '12-31',
        irbaNumber: '904812',
        saicaNumber: 'SAICA-2024-81',
        vatNumber: '4920192841',
      },

      // User roster (persisted) — seeded with default admin
      users: [DEFAULT_ADMIN],

      // ── Auth Actions ──────────────────────────────────────────────
      login: (user) => set({ isLoggedIn: true, user }),
      logout: () => set({ isLoggedIn: false, user: null }),
      updateFirm: (firm) => set(s => ({ firm: { ...s.firm, ...firm } })),

      // ── User Management Actions ───────────────────────────────────
      /** Create a new user. Returns { ok, error } */
      addUser: ({ name, email, password, role }) => {
        const { users } = get()
        if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
          return { ok: false, error: 'A user with this email already exists.' }
        }
        const newUser = {
          id: `user-${Date.now()}`,
          name,
          email,
          password,
          role,
          isAdmin: role === 'Senior Audit Partner',
          createdAt: new Date().toISOString(),
        }
        set({ users: [...users, newUser] })
        return { ok: true }
      },

      /** Update an existing user's fields. Returns { ok, error } */
      updateUser: (id, fields) => {
        const { users } = get()
        // Prevent duplicate email
        if (fields.email) {
          const conflict = users.find(
            u => u.email.toLowerCase() === fields.email.toLowerCase() && u.id !== id
          )
          if (conflict) return { ok: false, error: 'Email already in use by another user.' }
        }
        set({
          users: users.map(u => {
            if (u.id !== id) return u
            const updated = {
              ...u,
              ...fields,
              isAdmin: (fields.role ?? u.role) === 'Senior Audit Partner',
            }
            return updated
          }),
        })
        // Refresh current session if user edited themselves
        const currentUser = get().user
        if (currentUser?.id === id) {
          set({ user: { ...currentUser, ...fields } })
        }
        return { ok: true }
      },

      /** Delete a user by id. Cannot delete the last admin or yourself. */
      deleteUser: (id) => {
        const { users, user: currentUser } = get()
        if (currentUser?.id === id) {
          return { ok: false, error: 'You cannot delete your own account.' }
        }
        const admins = users.filter(u => u.isAdmin)
        const target = users.find(u => u.id === id)
        if (target?.isAdmin && admins.length <= 1) {
          return { ok: false, error: 'Cannot delete the last administrator account.' }
        }
        set({ users: users.filter(u => u.id !== id) })
        return { ok: true }
      },

      /** Validate credentials against the users list. Returns matching user or null. */
      validateLogin: (email, password) => {
        const { users } = get()
        return users.find(
          u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
        ) ?? null
      },

      /** Reset store to default — used for testing only */
      resetUsers: () => set({ users: [DEFAULT_ADMIN] }),
    }),
    {
      name: 'provident-auth',
      // On rehydration, ensure the default admin always exists
      onRehydrateStorage: () => (state) => {
        if (!state) return
        const hasAdmin = state.users?.some(u => u.id === DEFAULT_ADMIN.id)
        if (!hasAdmin) {
          state.users = [DEFAULT_ADMIN, ...(state.users ?? [])]
        }
      },
    }
  )
)
