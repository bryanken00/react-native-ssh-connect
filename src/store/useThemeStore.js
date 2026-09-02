import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

const useThemeStore = create(
  persist(
    (set, get) => ({
      isDarkMode: false,

      toggleTheme: () => {
        set((state) => ({ isDarkMode: !state.isDarkMode }));
      },

      setTheme: (isDark) => {
        set({ isDarkMode: isDark });
      },

      getTheme: () => {
        return get().isDarkMode;
      },
    }),
    {
      name: "theme-storage",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);

export default useThemeStore;
