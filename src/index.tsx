import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/index.css';

// Rendre obsolète cette partie en la commentant, car Next.js n'utilise pas ce fichier pour le rendu
// mais nous le laissons pour la compatibilité avec Vercel
/*
const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
*/

// Également exporter App pour être utilisé par d'autres modules
export default App;
export { App }; 