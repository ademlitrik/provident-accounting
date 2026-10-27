import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useAppStore = create(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      activeClient: null,
      theme: 'Colorful', // 'Colorful', 'Dark Gray', 'Black', 'White', 'Use system setting'
      officeBackground: 'No Background', // 'No Background', 'Circles and Stripes', 'Circuit', 'Clouds', 'Doodle Circles', 'Stars'
      accentColor: '#5B5FC7',
      language: 'en',

      // Cloud / SharePoint / Desktop synchronization settings
      cloudSync: {
        autoCreateDesktopFolder: true,
        customStoragePath: '', // Empty means ~/Desktop/Provident Clients
        sharepointUrl: '',
        sharepointSyncEnabled: false,
        lastSyncedFolder: null,
      },

      toggleSidebar: () => set(s => ({ sidebarCollapsed: !s.sidebarCollapsed })),
      setActiveClient: (client) => set({ activeClient: client }),
      setTheme: (theme) => set({ theme }),
      setOfficeBackground: (officeBackground) => set({ officeBackground }),
      setAccentColor: (accentColor) => set({ accentColor }),
      setLanguage: (language) => set({ language }),
      updateCloudSync: (fields) => set(s => ({ cloudSync: { ...s.cloudSync, ...fields } })),
    }),
    { name: 'provident-app-settings' }
  )
)
