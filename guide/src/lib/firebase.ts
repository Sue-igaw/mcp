import { initializeApp, getApps } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBRHCcz7jQfGLV4pUAUPPpiBZrvEjRDQDU",
  authDomain: "mobileindex-mcp.firebaseapp.com",
  projectId: "mobileindex-mcp",
  storageBucket: "mobileindex-mcp.firebasestorage.app",
  messagingSenderId: "355849060314",
  appId: "1:355849060314:web:95f7034928ecdd9211cae3",
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export { auth, provider };
export const ALLOWED_DOMAIN = "igaworks.com";
