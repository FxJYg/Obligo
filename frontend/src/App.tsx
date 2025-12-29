import { useEffect, useState } from 'react'
// import './App.css'
import axios from 'axios';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { AppProvider, useApp } from './contexts/AppContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import SpacePage from './pages/Space';
import CalendarPage from './pages/CalendarPage';
import SettingsPage from './pages/Settings';
import Login from './pages/Login';

function AppRoutes() {
  const { currentUser } = useApp(); 
  
  const [users, setUsers] = useState([]);

  useEffect(() => {
    // 1. URL must match your Rails server port
    axios.get('http://localhost:3000/users')
      .then(response => {
        setUsers(response.data);
      })
      .catch(error => console.error("Error fetching data:", error));
  }, []);

if (!currentUser) {
    return <Login />;
}

return (
  <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="space" element={<SpacePage />} />
        <Route path="calendar" element={<CalendarPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AppProvider>
        <HashRouter>
          <AppRoutes />
        </HashRouter>
      </AppProvider>
    </ThemeProvider>
  );
};

export default App
