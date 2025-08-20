import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Moon, Sun, Heart, Calendar, RefreshCw } from 'lucide-react';
import Default from './components/pages/Default';
import Standings from './components/pages/Standings';
import Players from './components/pages/Players';
import Teams from './components/pages/Teams';
import GameBox from "./components/pages/GameBox";
import './App.css';

// Navigation Component - This must be inside BrowserRouter to use useLocation
const Navigation = ({ darkMode }) => {
  const location = useLocation();
  
  return (
    <nav className="nav-links">
      <Link 
        to="/" 
        className={`nav-link ${darkMode ? 'dark' : 'light'} ${location.pathname === '/' ? 'active' : ''}`}
      >
        Home
      </Link>
      <Link 
        to="/standings" 
        className={`nav-link ${darkMode ? 'dark' : 'light'} ${location.pathname === '/standings' ? 'active' : ''}`}
      >
        Standings
      </Link>
      <Link 
        to="/players" 
        className={`nav-link ${darkMode ? 'dark' : 'light'} ${location.pathname === '/players' ? 'active' : ''}`}
      >
        Players
      </Link>
      <Link 
        to="/teams" 
        className={`nav-link ${darkMode ? 'dark' : 'light'} ${location.pathname === '/teams' ? 'active' : ''}`}
      >
        Teams
      </Link>
    </nav>
  );
};

// Main App Layout - This must be inside BrowserRouter to use Navigation
const AppLayout = () => {
  const [darkMode, setDarkMode] = useState(() => {
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  
  const [selectedDate, setSelectedDate] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Get current baseball date (before 9am = previous day)
  const getCurrentBaseballDate = useCallback(() => {
    const now = new Date();
    const currentHour = now.getHours();
    
    if (currentHour < 9) {
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      return formatDateForAPI(yesterday);
    }
    
    return formatDateForAPI(now);
  }, []);

  // Format date for API
  const formatDateForAPI = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Date range for picker
  const dateRange = useMemo(() => {
    const minDate = new Date();
    minDate.setDate(minDate.getDate() - 30);
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 30);
    
    return {
      min: formatDateForAPI(minDate),
      max: formatDateForAPI(maxDate)
    };
  }, []);

  // Handle date change
  const handleDateChange = (newDate) => {
    setSelectedDate(newDate);
    // We'll need to pass this to the Default component somehow
  };

  // Handle refresh
  const handleRefresh = () => {
    setIsRefreshing(true);
    // We'll need to trigger refresh in the active component
    setTimeout(() => setIsRefreshing(false), 1000); // Reset after animation
  };

  // Initialize date
  useEffect(() => {
    const today = getCurrentBaseballDate();
    setSelectedDate(today);
  }, [getCurrentBaseballDate]);

  // Listen for system dark mode changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => setDarkMode(e.matches);
    mediaQuery.addListener(handleChange);
    
    return () => mediaQuery.removeListener(handleChange);
  }, []);

  return (
    <div className={`mlb-app ${darkMode ? 'dark' : 'light'}`}>
      {/* Header */}
      <header className={`header ${darkMode ? 'dark' : 'light'}`}>
        <div className="header-content">
          {/* Logo */}
          <div className="logo-section">
            <div className="logo">
              <img src="/assets/Major_League_Baseball_logo.svg" alt="MLB Logo" />
            </div>
          </div>

          {/* Navigation - Desktop */}
          <Navigation darkMode={darkMode} />

          {/* Controls */}
          <div className="controls">
            {/* Date picker */}
            <div className="date-picker">
              <Calendar />
              <input
                type="date"
                value={selectedDate}
                min={dateRange.min}
                max={dateRange.max}
                onChange={(e) => handleDateChange(e.target.value)}
                className={`date-input ${darkMode ? 'dark' : 'light'}`}
              />
            </div>

            {/* Refresh button */}
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className={`icon-button ${darkMode ? 'dark' : 'light'}`}
              style={{opacity: isRefreshing ? 0.5 : 1}}
            >
              <RefreshCw style={{
                animation: isRefreshing ? 'spin 1s linear infinite' : 'none'
              }} />
            </button>

            {/* Dark mode toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`icon-button ${darkMode ? 'dark' : 'light'}`}
            >
              {darkMode ? <Sun /> : <Moon />}
            </button>
          </div>
        </div>
      </header>

      {/* Main content - Route components */}
      <main className="main-content">
        <Routes>
          <Route 
            path="/" 
            element={
              <Default 
                darkMode={darkMode} 
                selectedDate={selectedDate}
                onDateChange={setSelectedDate}
                isRefreshing={isRefreshing}
                onRefreshComplete={() => setIsRefreshing(false)}
              />
            } 
          />
          <Route 
            path="/standings" 
            element={
              <Standings 
                darkMode={darkMode}
                selectedDate={selectedDate}
                onDateChange={setSelectedDate}
                isRefreshing={isRefreshing}
                onRefreshComplete={() => setIsRefreshing(false)}
              />
            } 
          />
          <Route 
            path="/players" 
            element={
              <Players 
                darkMode={darkMode}
                selectedDate={selectedDate}
                onDateChange={setSelectedDate}
                isRefreshing={isRefreshing}
                onRefreshComplete={() => setIsRefreshing(false)}
              />
            } 
          />
          <Route 
            path="/teams" 
            element={
              <Teams 
                darkMode={darkMode}
                selectedDate={selectedDate}
                onDateChange={setSelectedDate}
                isRefreshing={isRefreshing}
                onRefreshComplete={() => setIsRefreshing(false)}
              />
            } 
          />
          <Route 
            path="/gamebox" 
            element={
              <GameBox 
                darkMode={darkMode}
                selectedDate={selectedDate}
                onDateChange={setSelectedDate}
                isRefreshing={isRefreshing}
                onRefreshComplete={() => setIsRefreshing(false)}
              />
            } 
          />
        </Routes>
      </main>

      {/* Footer */}
      <footer className={`footer ${darkMode ? 'dark' : 'light'}`}>
        <div className="footer-content">
          <div className="footer-links">
            <a href="#" className="footer-link">Privacy Policy</a>
            <a href="#" className="footer-link">Terms of Service</a>
            <a href="#" className="footer-link">Contact</a>
            <a href="#" className="footer-link">About</a>
            <a href="#" className="footer-link">API</a>
          </div>
          <div className="footer-divider"></div>
          <div className="footer-bottom">
            <span>Made with</span>
            <Heart className="footer-heart" size={16} fill="currentColor" />
            <span>for baseball fans everywhere</span>
          </div>
          <p style={{fontSize: '0.75rem', opacity: 0.5, textAlign: 'center'}}>
            © 2025 MLB Scoreboard. Data provided by MLB Advanced Media.
          </p>
        </div>
      </footer>
    </div>
  );
};

// Main App Component - This wraps everything in BrowserRouter
const App = () => {
  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  );
};

export default App;