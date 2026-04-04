import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'

// Init Capacitor and notifications on native
async function init(){
  try{
    const { Capacitor } = await import('@capacitor/core');
    window.Capacitor = Capacitor;
    if(Capacitor.isNativePlatform()){
      const { LocalNotifications } = await import('@capacitor/local-notifications');
      await LocalNotifications.requestPermissions();
    }
  }catch(e){ console.warn('Capacitor init error:', e); }
}

init();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
