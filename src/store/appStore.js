import { create } from 'zustand'

export const useAppStore = create((set) => ({
  sidebarCollapsed: false,
  activeClient: null,
  theme: 'Colorful', // 'Colorful', 'Dark Gray', 'Black', 'White', 'Use system setting'
  officeBackground: 'No Background', // 'No Background', 'Circles and Stripes', 'Circuit', 'Clouds', 'Doodle Circles', 'Stars'
  accentColor: '#5B5FC7',

  toggleSidebar: () => set(s => ({ sidebarCollapsed: !s.sidebarCollapsed })),
  setActiveClient: (client) => set({ activeClient: client }),
  setTheme: (theme) => set({ theme }),
  setOfficeBackground: (officeBackground) => set({ officeBackground }),
  setAccentColor: (accentColor) => set({ accentColor }),
}))
