import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './styles/globals.css'
import { initStorageGuard } from './utils/storageGuard'

// Protect browser DevTools from leaking sensitive storage keys and tokens
initStorageGuard()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
