import React from 'react';
import ReactDOM from 'react-dom/client'; // Ou 'react-dom' selon votre version
import { ErrorProvider } from './ErrorContext'; // Importez ErrorProvider
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ErrorProvider>
      <App />
    </ErrorProvider>
  </React.StrictMode>
);