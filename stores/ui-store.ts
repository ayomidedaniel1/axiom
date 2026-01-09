import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UIState {
  // Conversation state
  currentConversationId: string | null;

  // Sidebar visibility
  sidebarVisible: boolean;
  historyVisible: boolean;

  // Theme
  theme: 'dark' | 'light';
}

interface UIActions {
  setCurrentConversation: (id: string | null) => void;
  toggleSidebar: () => void;
  toggleHistory: () => void;
  setSidebarVisible: (visible: boolean) => void;
  setHistoryVisible: (visible: boolean) => void;
  setTheme: (theme: 'dark' | 'light') => void;
  toggleTheme: () => void;
}

export type UIStore = UIState & UIActions;

export const useUIStore = create<UIStore>()(
  persist(
    (set) => ({
      currentConversationId: null,
      sidebarVisible: true,
      historyVisible: true,
      theme: 'dark',
      setCurrentConversation: (id) => set({ currentConversationId: id }),

      toggleSidebar: () => set((state) => ({ sidebarVisible: !state.sidebarVisible })),
      toggleHistory: () => set((state) => ({ historyVisible: !state.historyVisible })),
      setSidebarVisible: (visible) => set({ sidebarVisible: visible }),
      setHistoryVisible: (visible) => set({ historyVisible: visible }),

      setTheme: (theme) => set({ theme }),
      toggleTheme: () => set((state) => ({
        theme: state.theme === 'dark' ? 'light' : 'dark'
      })),
    }),
    {
      name: 'axiom-ui-storage',
      partialize: (state) => ({
        theme: state.theme,
        sidebarVisible: state.sidebarVisible,
        historyVisible: state.historyVisible,
      }),
    }
  )
);
