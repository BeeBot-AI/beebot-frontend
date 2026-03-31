import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { AuthProvider } from './context/AuthContext'
import { TourProvider } from './context/TourContext'
import './index.css'
import App from './App.jsx'
import axios from 'axios';

axios.defaults.withCredentials = true;

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <AuthProvider>
        <TourProvider>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </TourProvider>
      </AuthProvider>
    </GoogleOAuthProvider>
  </StrictMode>,
)
