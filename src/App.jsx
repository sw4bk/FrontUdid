import { Routes, Route, Navigate } from 'react-router-dom';

import ProtectedRoute from './components/ProtectedRoute';

import Login from './Pages/Login';
import Dashboard from './Pages/Dashboard';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />}/>
      <Route path="/dashboard" element={<Dashboard />}/>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;