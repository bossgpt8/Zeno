// Firebase configuration - using Firebase integration blueprint
import { initializeApp, type FirebaseApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, type User } from "firebase/auth";
import { getFirestore, collection, doc, getDocs, setDoc, deleteDoc, query, where, orderBy, type Firestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.firebaseapp.com`,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.firebasestorage.app`,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

let app: FirebaseApp | null = null;
let auth: ReturnType<typeof getAuth> | null = null;
let db: Firestore | null = null;

export const isFirebaseConfigured = !!(
  firebaseConfig.apiKey && 
  firebaseConfig.projectId && 
  firebaseConfig.appId
);

if (isFirebaseConfigured) {
  try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
  } catch (error) {
    console.error("Firebase initialization error:", error);
  }
}

export { auth, db };

export const signInWithGoogle = async (): Promise<User | null> => {
  if (!auth) {
    console.warn("Firebase auth not configured");
    return null;
  }
  
  try {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    return result.user;
  } catch (error) {
    console.error("Sign in error:", error);
    throw error;
  }
};

export const signOutUser = async (): Promise<void> => {
  if (!auth) return;
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Sign out error:", error);
    throw error;
  }
};

export const subscribeToAuth = (callback: (user: User | null) => void): (() => void) => {
  if (!auth) {
    callback(null);
    return () => {};
  }
  return onAuthStateChanged(auth, callback);
};

// Firestore helpers for conversations
export const saveConversation = async (userId: string, conversationId: string, data: any) => {
  if (!db) return;
  const docRef = doc(db, "users", userId, "conversations", conversationId);
  await setDoc(docRef, { ...data, updatedAt: new Date() });
};

export const getConversations = async (userId: string) => {
  if (!db) return [];
  const q = query(
    collection(db, "users", userId, "conversations"),
    orderBy("updatedAt", "desc")
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const deleteConversation = async (userId: string, conversationId: string) => {
  if (!db) return;
  await deleteDoc(doc(db, "users", userId, "conversations", conversationId));
};
