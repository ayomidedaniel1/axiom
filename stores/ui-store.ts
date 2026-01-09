import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UIState {
  // Conversation state
  currentConversationId: string | null;

  // Sidebar visibility
  sidebarVisible: boolean;
  historyVisible: boolean;

  // Mobile state
  isMobile: boolean;
  hasHydrated: boolean;

  // Theme
  theme: 'dark' | 'light';
}

interface UIActions {
  setCurrentConversation: (id: string | null) => void;
  toggleSidebar: () => void;
  toggleHistory: () => void;
  setSidebarVisible: (visible: boolean) => void;
  setHistoryVisible: (visible: boolean) => void;
  setIsMobile: (isMobile: boolean) => void;
  setHasHydrated: (hydrated: boolean) => void;
  setTheme: (theme: 'dark' | 'light') => void;
  toggleTheme: () => void;
}

export type UIStore = UIState & UIActions;

export const useUIStore = create<UIStore>()(
  persist(
    (set, get) => ({
      currentConversationId: null,
      sidebarVisible: true,
      historyVisible: true,
      isMobile: false,
      hasHydrated: false,
      theme: 'dark',
      setCurrentConversation: (id) => set({ currentConversationId: id }),

      // Toggle sidebar - on mobile, close history when opening sidebar
      toggleSidebar: () => set((state) => {
        const newSidebarVisible = !state.sidebarVisible;
        if (state.isMobile && newSidebarVisible) {
          return { sidebarVisible: true, historyVisible: false };
        }
        return { sidebarVisible: newSidebarVisible };
      }),

      // Toggle history - on mobile, close sidebar when opening history
      toggleHistory: () => set((state) => {
        const newHistoryVisible = !state.historyVisible;
        if (state.isMobile && newHistoryVisible) {
          return { historyVisible: true, sidebarVisible: false };
        }
        return { historyVisible: newHistoryVisible };
      }),

      setSidebarVisible: (visible) => set((state) => {
        if (state.isMobile && visible) {
          return { sidebarVisible: visible, historyVisible: false };
        }
        return { sidebarVisible: visible };
      }),

      setHistoryVisible: (visible) => set((state) => {
        if (state.isMobile && visible) {
          return { historyVisible: visible, sidebarVisible: false };
        }
        return { historyVisible: visible };
      }),

      setIsMobile: (isMobile) => set({ isMobile }),
      setHasHydrated: (hydrated) => set({ hasHydrated: hydrated }),

      setTheme: (theme) => set({ theme }),
      toggleTheme: () => set((state) => ({
        theme: state.theme === 'dark' ? 'light' : 'dark'
      })),
    }),
    {
      name: 'axiom-ui-storage',
      partialize: (state) => ({
        theme: state.theme,
        // Don't persist sidebar visibility - we want fresh state on mobile
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.setHasHydrated(true);
        }
      },
    }
  )
);
