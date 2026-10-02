import { StudentProfile, Grade } from '../types';
import { idbGet, idbPut, STORES } from '../db/indexedDb';

const PROFILE_KEY = 'current_student_profile';

export async function getStudentProfile(): Promise<StudentProfile> {
  const existing = await idbGet<StudentProfile>(STORES.STUDENT_PROFILE, PROFILE_KEY);
  if (existing) {
    return existing;
  }

  // Default demo student profile
  const defaultProfile: StudentProfile = {
    localUuid: PROFILE_KEY,
    nickname: 'Nhà thám hiểm',
    grade: 2,
    totalStars: 10,
    soundEnabled: true,
    avatar: '🧒',
  };

  await idbPut<StudentProfile>(STORES.STUDENT_PROFILE, defaultProfile);
  return defaultProfile;
}

export async function updateStudentProfile(partial: Partial<StudentProfile>): Promise<StudentProfile> {
  const current = await getStudentProfile();
  const updated: StudentProfile = {
    ...current,
    ...partial,
  };
  await idbPut<StudentProfile>(STORES.STUDENT_PROFILE, updated);
  return updated;
}

export async function addStarsToProfile(stars: number): Promise<void> {
  const current = await getStudentProfile();
  current.totalStars += stars;
  await idbPut<StudentProfile>(STORES.STUDENT_PROFILE, current);
}
