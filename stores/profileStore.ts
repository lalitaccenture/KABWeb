// stores/profileStore.ts
import { create } from 'zustand';

type Profile = {
  name: string;
  email: string;
  // add other profile fields as needed
};

type ProfileStore = {
  profile: Profile | null;
  setProfile: (profile: Profile) => void;
};

export const useProfileStore = create<ProfileStore>((set) => ({
  profile: null,
  setProfile: (profile) => set({ profile }),
}));
