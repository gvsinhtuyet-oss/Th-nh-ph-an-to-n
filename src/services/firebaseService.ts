// Firebase Integration with seamless local dev fallback

export interface AuthUserState {
  uid: string;
  email: string | null;
  displayName: string | null;
  role: 'student' | 'teacher' | 'admin';
  isLocalMode: boolean;
}

const LOCAL_AUTH_STORAGE_KEY = 'tpat_local_auth_user';

class FirebaseService {
  private isConfigured: boolean = false;
  private currentUser: AuthUserState | null = null;
  private authListeners: Array<(user: AuthUserState | null) => void> = [];

  constructor() {
    this.checkConfig();
    this.loadLocalAuth();
  }

  private checkConfig() {
    // Check if Firebase env vars are injected in environment
    const apiKey = typeof process !== 'undefined' ? process.env.VITE_FIREBASE_API_KEY : undefined;
    this.isConfigured = Boolean(apiKey);
  }

  private loadLocalAuth() {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(LOCAL_AUTH_STORAGE_KEY);
      if (stored) {
        try {
          this.currentUser = JSON.parse(stored);
        } catch {
          this.currentUser = null;
        }
      }
    }
  }

  public isCloudConfigured(): boolean {
    return this.isConfigured;
  }

  public getCurrentUser(): AuthUserState | null {
    return this.currentUser;
  }

  public onAuthStateChanged(callback: (user: AuthUserState | null) => void) {
    this.authListeners.push(callback);
    callback(this.currentUser);
    return () => {
      this.authListeners = this.authListeners.filter(cb => cb !== callback);
    };
  }

  private notifyAuthChange() {
    this.authListeners.forEach(cb => cb(this.currentUser));
  }

  // Teacher / Admin quick login (Local Mode or Cloud Auth)
  public async loginAsTeacher(email: string = 'gvsinhtuyet@gmail.com'): Promise<AuthUserState> {
    const user: AuthUserState = {
      uid: 'teacher-' + btoa(email).substring(0, 8),
      email,
      displayName: 'Thầy/Cô Giáo Viên',
      role: 'teacher',
      isLocalMode: !this.isConfigured,
    };
    this.currentUser = user;
    if (typeof window !== 'undefined') {
      localStorage.setItem(LOCAL_AUTH_STORAGE_KEY, JSON.stringify(user));
    }
    this.notifyAuthChange();
    return user;
  }

  public async logout(): Promise<void> {
    this.currentUser = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem(LOCAL_AUTH_STORAGE_KEY);
    }
    this.notifyAuthChange();
  }
}

export const firebaseService = new FirebaseService();
