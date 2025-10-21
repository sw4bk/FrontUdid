import React from 'react'
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';

import App from './App.jsx'

import  {AuthProvider} from './Hooks/AuthProvider.jsx';
import { NotificationProvider } from './Hooks/NotificationProvider.jsx';

import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  // <React.StrictMode>
    <Router>
      <AuthProvider>
        <NotificationProvider>
          <App />
        </NotificationProvider>
      </AuthProvider>
    </Router>
  // </React.StrictMode>
);