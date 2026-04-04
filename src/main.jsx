import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'

// Init Capacitor and notifications on native
async function init(){
  try{
    // Wait for DOM to be ready
    await new Promise(resolve => setTimeout(resolve, 100));

    const { Capacitor } = await import('@capacitor/core');
    window.Capacitor = Capacitor;

    if(Capacitor.isNativePlatform()){
      const { LocalNotifications } = await import('@capacitor/local-notifications');
      const perm = await LocalNotifications.checkPermissions();
      if(perm.display !== 'granted') {
        await LocalNotifications.requestPermissions();
      }
    }
  }catch(e){
    console.warn('Capacitor init error:', e);
  }
}

// Don't await - let it run in background
init();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
