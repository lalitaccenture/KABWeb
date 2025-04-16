import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type ProfileStore = {
  state: string;
  setState: (state: string) => void;
};

export const useProfileStore = create<ProfileStore>()(
  persist(
    (set) => ({
      state: '',
      setState: (state) => set({ state }),
    }),
    {
      name: 'profile-store', // key in localStorage
    }
  )
);
