export interface UserProfile {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  createdAt: number | string;
  updatedAt: number | string;
  moviesWatched?: number;
  theatresHosted?: number;
  watchHours?: number;
}
