import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import { PremiumProvider } from './context/PremiumContext.jsx'
import './index.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <PremiumProvider>
      <App />
    </PremiumProvider>
  </StrictMode>,
)