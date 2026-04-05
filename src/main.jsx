import React from 'react'
import ReactDOM from 'react-dom/client'
import { Capacitor } from '@capacitor/core'
import App from './App'

// Set Capacitor globally and synchronously — must happen before App loads
window.Capacitor = Capacitor;

// Request notification permissions on native (non-blocking, won't crash if it fails)
if(Capacitor.isNativePlatform()){
  import('@capacitor/local-notifications').then(({ LocalNotifications }) => {
    LocalNotifications.requestPermissions().catch(()=>{});
  }).catch(()=>{});
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
