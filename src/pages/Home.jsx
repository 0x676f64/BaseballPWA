import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Calendar, BarChart3, Users, Moon, Sun, RefreshCw, Heart } from 'lucide-react';

// Custom styles for the app
const styles = `
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  html, body, #root {
    height: 100%;
    overflow-x: hidden;
    scroll-bar-width: none; 
    width: 100%;
  }

  body {
    font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    background: var(--bg-primary);
    color: var(--text-primary);
    overflow-x: hidden;
    background-size: cover; 
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  .mlb-app {
    min-height: 100vh;
    min-height: 100dvh;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
    transition: all 0.3s ease; 
    display: flex;
    flex-direction: column; 
    width: 100%;
  }

  .mlb-app.light {
    background: linear-gradient(135deg, #f8f9fa, #d9e6f3ff);
    color: #1f2937;
  }

  .mlb-app.dark {
    background: linear-gradient(135deg, #051e43 0%, #051e43 50%, #000000 100%);
    color: #ffffff;
  }

  .header {
    position: sticky;
    top: 0;
    z-index: 50;
    backdrop-filter: blur(20px);
    border-bottom: 1px solid #bf0d3d;
    padding: 1rem;
    width: 100%;
  }

  .header.light {
    background: #f7fafcff;
    border-color: #6ba8f8ff;
  }

  .header.dark {
    background: rgba(5, 30, 67, 1);
    border-color: rgba(190, 13, 63, 1);
  }

  .header-content {
    max-width: 1200px;
    margin: 0 auto;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
  }

  .logo-section {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .logo {
    font-size: 1.5rem;
    font-weight: bold;
    background: linear-gradient(135deg, #ef4444 0%, #3b82f6 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  .controls {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .date-picker {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .date-picker svg {
    width: 1rem;
    height: 1rem;
    opacity: 0.7;
  }

  .date-input {
    padding: 0.5rem;
    border: 1px solid rgba(156, 163, 175, 0.3);
    border-radius: 0.5rem;
    font-size: 0.875rem;
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    transition: all 0.2s ease;
  }

  .date-input.light {
    background: rgba(255, 255, 255, 0.9);
    color: #1f2937;
    border-color: rgba(0, 0, 0, 0.2);
  }

  .date-input.dark {
    background: rgba(17, 24, 39, 0.9);
    color: #ffffff;
    border-color: rgba(255, 255, 255, 0.2);
  }

  .icon-button {
    padding: 0.5rem;
    border: none;
    border-radius: 0.5rem;
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .icon-button.light {
    background: rgba(0, 0, 0, 0.05);
    color: #4b5563;
  }

  .icon-button.light:hover {
    background: rgba(0, 0, 0, 0.1);
  }

  .icon-button.dark {
    background: rgba(255, 255, 255, 0.1);
    color: #d1d5db;
  }

  .icon-button.dark:hover {
    background: rgba(255, 255, 255, 0.2);
  }

  .icon-button svg {
    width: 1rem;
    height: 1rem;
  }

  .main-content {
    flex: 1;
    width: 100%;
    max-width: 1800px;
    margin: 0 auto;
    padding: 2rem;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
  }

  .nav-links {
    display: flex;
    gap: 2rem;
    align-items: center;
  }

  .nav-link {
    text-decoration: none;
    font-weight: 500;
    padding: 0.5rem 1rem;
    border-radius: 0.5rem;
    transition: all 0.3s ease;
  }

  .nav-link.light {
    color: #1f2937;
  }

  .nav-link.dark {
    color: #f9fafb;
  }

  .nav-link:hover {
    color: #3b82f6;
    background: rgba(59, 130, 246, 0.1);
  }

  .nav-link.active {
    color: #3b82f6;
    background: rgba(59, 130, 246, 0.1);
    font-weight: 600;
  }

  .games-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(310px, 1fr));
    gap: 1.5rem;
    width: 100%;
  }

  .game-card {
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 1rem;
    padding: 1rem;
    backdrop-filter: blur(20px);
    cursor: pointer;
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;
  }

  .game-card.light {
    background: rgba(255, 255, 255, 0.6);
    border: 1px solid rgba(59, 131, 246, 0.39);
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  }

  .game-card.light:hover {
    background: rgba(255, 251, 251, 0.9);
    box-shadow: 0 10px 25px -3px rgba(0, 0, 0, 0.1);
    transform: translateY(-2px);
    border: 1px solid rgba(220, 38, 38, 0.4);
  }

  .game-card.dark {
    background: #031228;
    border-color: rgba(255, 255, 255, 0.1);
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3);
  }

  .game-card.dark:hover {
    background: #020c1b;
    box-shadow: 0 10px 25px -3px rgba(0, 0, 0, 0.5);
    transform: translateY(-2px);
    border-color: rgba(239, 68, 68, 0.3);
  }

  .game-card.live {
    animation: pulse 3s infinite;
  }

  .game-card.live.light {
    border-color: rgba(34, 197, 94, 0.5);
    box-shadow: 0 0 20px rgba(34, 197, 94, 0.1);
  }

  .game-card.live.dark {
    border-color: rgba(239, 68, 68, 0.5);
    box-shadow: 0 0 20px rgba(239, 68, 68, 0.1);
  }

  .live-indicator {
    position: absolute;
    top: 0.15rem;
    left: 1rem;
    display: flex;
    align-items: center;
    gap: 0.25rem;
  }

  .live-dot {
    width: 0.5rem;
    height: 0.5rem;
    background: #ef4444;
    border-radius: 50%;
    animation: pulse 3s infinite;
  }

  .live-text {
    font-size: 0.75rem;
    font-weight: 600;
    color: #ef4444;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .game-status {
    text-align: right;
    font-weight: 700;
    font-size: 0.875rem;
    margin-top: 1rem;
    letter-spacing: 0.025em;
    margin-right: 1.3rem;
  }

  .game-status.live {
    color: #ef4444;
  }

  .game-status.scheduled {
    color: #ef4444;
  }

  .game-status.final {
    color: #ef4444;
  }

  .teams-container {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .team-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .team-info {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .team-logo {
    width: 2rem;
    height: 2rem;
    object-fit: contain;
    flex-shrink: 0;
  }

  .team-abbr {
    font-weight: 600;
    font-size: 0.875rem;
    letter-spacing: 0.025em;
    color: #0252bb;
  }

  .game-card.dark .team-abbr {
    color: #d1d5db;
    font-weight: 600;
  }

  .team-score {
    font-weight: 700;
    font-size: 1.125rem;
    tabular-nums: true;
    color: #0252bb;
  }

  .game-card.dark .team-score {
    color: #f9fafb;
    font-weight: 700;
  }

  .loading-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 5rem 0;
    gap: 1rem;
  }

  .spinner {
    width: 3rem;
    height: 3rem;
    border: 4px solid rgba(59, 130, 246, 0.1);
    border-top: 4px solid #3b82f6;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  .empty-state {
    text-align: center;
    padding: 5rem 1rem;
  }

  .empty-emoji {
    font-size: 4rem;
    margin-bottom: 1rem;
    opacity: 0.5;
  }

  .scorebug {
    position: absolute;
    top: 3.5rem;
    right: 1rem;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .bases-outs-container {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .bases-outs-svg {
    width: 84px;
    height: 79px;
  }

  .bases-outs-svg .out-circle {
    stroke-width: 1;
  }

  .light .bases-outs-svg .out-circle {
    fill: #f9fafb;
    stroke: #0b4796ff;
  }

  .light .bases-outs-svg .out-circle.filled {
    fill: #0b4796ff;
    stroke: #0b4796ff;
  }

  .dark .bases-outs-svg .out-circle {
    fill: transparent;
    stroke: #d9e6f3ff;
  }

  .dark .bases-outs-svg .out-circle.filled {
    fill: #d9e6f3ff;
    stroke: #d9e6f3ff;
  }

  .light .bases-outs-svg .base {
    fill: #f2cfd8;
    stroke: #bf0d3d;
  }

  .light .bases-outs-svg .base.occupied {
    fill: #730825;
    stroke: #bf0d3d;
  }

  .dark .bases-outs-svg .base {
    fill: transparent;
    stroke: #bf0d3d;
  }

  .dark .bases-outs-svg .base.occupied {
    fill: #bf0d3d;
    stroke: #bf0d3d;
  }

  .footer {
    margin-top: auto;
    backdrop-filter: blur(20px);
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    padding: 2rem 1rem;
    width: 100%;
  }

  .footer.light {
    background: #f7fafc;
    border-color: rgba(0, 0, 0, 0.1);
  }

  .footer.dark {
    background: rgba(5, 30, 67, 0.8);
    border-color: rgba(190, 13, 63, 0.3);
  }

  .footer-content {
    max-width: 1200px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
  }

  .footer-links {
    display: flex;
    gap: 2rem;
    flex-wrap: wrap;
    justify-content: center;
  }

  .footer-link {
    color: inherit;
    text-decoration: none;
    font-size: 0.875rem;
    font-weight: 500;
    opacity: 0.7;
    transition: all 0.2s ease;
  }

  .footer-link:hover {
    opacity: 1;
    color: #3b82f6;
  }

  .footer-divider {
    width: 100%;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(190, 13, 63, 0.3), transparent);
    margin: 1rem 0;
  }

  .footer-bottom {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.875rem;
    opacity: 0.6;
  }

  .footer-heart {
    color: #ef4444;
    animation: heartbeat 2s ease-in-out infinite;
  }

  .placeholder-content {
    text-align: center;
    padding: 4rem 2rem;
  }

  .placeholder-content h1 {
    font-size: 2rem;
    margin-bottom: 1rem;
    background: linear-gradient(135deg, #ef4444 0%, #3b82f6 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  .placeholder-content p {
    font-size: 1.125rem;
    opacity: 0.7;
    margin-bottom: 2rem;
  }

  .placeholder-content .emoji {
    font-size: 4rem;
    margin: 2rem 0;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  @keyframes pulse {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.7;
    }
  }

  @keyframes heartbeat {
    0%, 100% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.1);
    }
  }

  @media (max-width: 768px) {
    .nav-links {
      display: none;
    }
    
    .main-content {
      padding: 1rem;
    }

    .header-content {
      flex-direction: column;
      gap: 1rem;
    }

    .controls {
      width: 100%;
      justify-content: center;
    }

    .games-grid {
      grid-template-columns: 1fr;
    }
  }
`;

// Navigation Component
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
    </nav>
  );
};

// Home component with scoreboard functionality
const Home = ({ darkMode }) => {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState('');
  const [error, setError] = useState(null);
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

  // Format game time
  const formatGameTime = (gameDate) => {
    const dateTime = new Date(gameDate);
    return dateTime.toLocaleTimeString([], {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  // Fetch team abbreviation
  const fetchAbbreviation = async (teamId) => {
    try {
      const response = await fetch(`https://statsapi.mlb.com/api/v1/teams/${teamId}`);
      const data = await response.json();
      return data.teams[0].abbreviation || "N/A";
    } catch (error) {
      console.error("Error fetching abbreviation:", error);
      return "N/A";
    }
  };

  // Fetch live game details
  const fetchGameDetails = async (gamePk) => {
    try {
      const response = await fetch(`https://statsapi.mlb.com/api/v1.1/game/${gamePk}/feed/live`);
      const data = await response.json();
      
      if (data?.liveData?.linescore) {
        const linescore = data.liveData.linescore;
        const inningHalf = linescore.inningHalf ? (linescore.inningHalf === "Top" ? "TOP" : "BOT") : "";
        const currentInning = linescore.currentInning || "";
        
        const plays = data.liveData?.plays;
        const count = plays?.currentPlay?.count || { balls: 0, strikes: 0, outs: 0 };
        
        const offense = linescore.offense || {};
        const basesOccupied = {
          first: !!offense.first,
          second: !!offense.second,
          third: !!offense.third
        };
        
        return {
          inning: `${inningHalf} ${currentInning}`.trim(),
          count: count,
          bases: basesOccupied
        };
      }
    } catch (error) {
      console.error("Error fetching game details:", error);
    }
    return {
      inning: "Live",
      count: { balls: 0, strikes: 0, outs: 0 },
      bases: { first: false, second: false, third: false }
    };
  };

  // Fetch games data
  const fetchGameData = useCallback(async (date, showRefresh = false) => {
    if (showRefresh) setIsRefreshing(true);
    else setLoading(true);
    
    setError(null);
    
    try {
      const apiUrl = `https://statsapi.mlb.com/api/v1/schedule?sportId=1&date=${date}`;
      const response = await fetch(apiUrl);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();

      if (!data.dates?.length || !data.dates[0].games?.length) {
        setGames([]);
        return;
      }

      const processedGames = await Promise.all(
        data.dates[0].games.map(async (game) => {
          const homeTeamId = game.teams.home.team.id;
          const awayTeamId = game.teams.away.team.id;
          
          const [homeAbbr, awayAbbr] = await Promise.all([
            fetchAbbreviation(homeTeamId),
            fetchAbbreviation(awayTeamId)
          ]);

          let status = game.status.detailedState;
          let liveData = null;
          
          if (status === "Final" || status === "Game Over" || status === "Completed Early") {
            status = "FINAL";
          } else if (status === "Pre-Game" || status === "Scheduled") {
            status = formatGameTime(game.gameDate);
          } else if (status === "In Progress") {
            liveData = await fetchGameDetails(game.gamePk);
            status = liveData.inning;
          }

          return {
            gamePk: game.gamePk,
            homeTeam: {
              id: homeTeamId,
              name: game.teams.home.team.name,
              abbreviation: homeAbbr,
              score: game.teams.home.score || 0
            },
            awayTeam: {
              id: awayTeamId,
              name: game.teams.away.team.name,
              abbreviation: awayAbbr,
              score: game.teams.away.score || 0
            },
            status,
            gameDate: new Date(game.gameDate),
            isLive: status.includes("TOP") || status.includes("BOT") || status === "Live",
            isFinal: status === "FINAL",
            liveData: liveData
          };
        })
      );

      const sortedGames = processedGames.sort((a, b) => {
        if (a.isLive && !b.isLive) return -1;
        if (b.isLive && !a.isLive) return 1;
        if (a.isFinal && !b.isFinal) return 1;
        if (b.isFinal && !a.isFinal) return -1;
        return a.gameDate - b.gameDate;
      });

      setGames(sortedGames);
    } catch (error) {
      console.error("Error fetching game data:", error);
      setError("Failed to load games. Please try again.");
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  // Initialize
  useEffect(() => {
    const today = getCurrentBaseballDate();
    setSelectedDate(today);
    fetchGameData(today);
  }, [getCurrentBaseballDate, fetchGameData]);

  // Auto-refresh for today's games
  useEffect(() => {
    if (selectedDate === getCurrentBaseballDate()) {
      const interval = setInterval(() => {
        fetchGameData(selectedDate, true);
      }, 30000);
      
      return () => clearInterval(interval);
    }
  }, [selectedDate, getCurrentBaseballDate, fetchGameData]);

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
    fetchGameData(newDate);
  };

  // Get team logo URL
  const getTeamLogoUrl = (teamId, isDark = false) => {
    return isDark 
      ? `https://www.mlbstatic.com/team-logos/team-cap-on-dark/${teamId}.svg`
      : `https://www.mlbstatic.com/team-logos/${teamId}.svg`;
  };

  // Bases and Outs SVG Component
  const BasesOutsSVG = ({ bases, outs }) => (
    <svg className="bases-outs-svg" viewBox="0 0 58 79" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="13" cy="61.5" r="6" className={`out-circle ${outs >= 1 ? 'filled' : ''}`} strokeWidth="1"/>
      <circle cx="30" cy="61.5" r="6" className={`out-circle ${outs >= 2 ? 'filled' : ''}`} strokeWidth="1"/>
      <circle cx="47" cy="61.5" r="6" className={`out-circle ${outs >= 3 ? 'filled' : ''}`} strokeWidth="1"/>
      
      <rect x="17.6066" y="29.7071" width="14" height="14" rx="0.5" 
            transform="rotate(45 17.6066 29.7071)" 
            className={`base ${bases.third ? 'occupied' : ''}`} 
            strokeWidth="1"/>
      <rect x="29.364" y="17.7071" width="14" height="14" rx="0.5" 
            transform="rotate(45 29.364 17.7071)" 
            className={`base ${bases.second ? 'occupied' : ''}`} 
            strokeWidth="1"/>
      <rect x="41.6066" y="29.7071" width="14" height="14" rx="0.5" 
            transform="rotate(45 41.6066 29.7071)" 
            className={`base ${bases.first ? 'occupied' : ''}`} 
            strokeWidth="1"/>
    </svg>
  );

  // Game component
  const GameCard = ({ game }) => (
    <div 
      className={`game-card ${darkMode ? 'dark' : 'light'} ${game.isLive ? 'live' : ''}`}
      onClick={() => window.open(`https://www.mlb.com/gameday/${game.gamePk}`, '_blank')}
    >
      {game.isLive && (
        <div className="live-indicator">
          <div className="live-dot"></div>
          <span className="live-text">Live</span>
        </div>
      )}
      
      <div className={`game-status ${
        game.isLive ? 'live' : game.isFinal ? 'final' : 'scheduled'
      }`}>
        {game.status}
      </div>

      <div className="teams-container">
        <div className="team-row">
          <div className="team-info">
            <img 
              src={getTeamLogoUrl(game.awayTeam.id, darkMode)} 
              alt={`${game.awayTeam.abbreviation} logo`}
              className="team-logo"
              onError={(e) => {
                e.target.src = getTeamLogoUrl(game.awayTeam.id, !darkMode);
              }}
            />
            <span className="team-abbr">
              {game.awayTeam.abbreviation}
            </span>
          </div>
          <span className="team-score">
            {game.awayTeam.score}
          </span>
        </div>

        <div className="team-row">
          <div className="team-info">
            <img 
              src={getTeamLogoUrl(game.homeTeam.id, darkMode)} 
              alt={`${game.homeTeam.abbreviation} logo`}
              className="team-logo"
              onError={(e) => {
                e.target.src = getTeamLogoUrl(game.homeTeam.id, !darkMode);
              }}
            />
            <span className="team-abbr">
              {game.homeTeam.abbreviation}
            </span>
          </div>
          <span className="team-score">
            {game.homeTeam.score}
          </span>
        </div>
      </div>

      {game.isLive && game.liveData && (
        <div className="scorebug">
          <div className="bases-outs-container">
            <BasesOutsSVG bases={game.liveData.bases} outs={game.liveData.count.outs} />
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Date picker and refresh in header controls */}
      <div style={{ display: 'none' }}>
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
        <button
          onClick={() => fetchGameData(selectedDate, true)}
          disabled={isRefreshing}
          className={`icon-button ${darkMode ? 'dark' : 'light'}`}
          style={{opacity: isRefreshing ? 0.5 : 1}}
        >
          <RefreshCw style={{
            animation: isRefreshing ? 'spin 1s linear infinite' : 'none'
          }} />
        </button>
      </div>

      {/* Main scoreboard content */}
      {loading && (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading games...</p>
        </div>
      )}

      {error && (
        <div className="loading-container">
          <p style={{color: '#ef4444', marginBottom: '1rem'}}>{error}</p>
          <button
            onClick={() => fetchGameData(selectedDate)}
            className={`icon-button ${darkMode ? 'dark' : 'light'}`}
            style={{padding: '0.75rem 1.5rem'}}
          >
            Try Again
          </button>
        </div>
      )}

      {!loading && !error && (
        <>
          <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
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
            <button
              onClick={() => fetchGameData(selectedDate, true)}
              disabled={isRefreshing}
              className={`icon-button ${darkMode ? 'dark' : 'light'}`}
              style={{opacity: isRefreshing ? 0.5 : 1, marginLeft: '1rem'}}
            >
              <RefreshCw style={{
                animation: isRefreshing ? 'spin 1s linear infinite' : 'none'
              }} />
            </button>
          </div>
          
          {games.length === 0 ? (
            <div className="empty-state">
              <div className="empty-emoji">⚾</div>
              <p style={{fontSize: '1.125rem', fontWeight: 600, marginBottom: '0.5rem'}}>
                No games scheduled
              </p>
              <p style={{opacity: 0.7}}>Try selecting a different date</p>
            </div>
          ) : (
            <div className="games-grid">
              {games.map((game) => (
                <GameCard key={game.gamePk} game={game} />
              ))}
            </div>
          )}
        </>
      )}
    </>
  );
};

// Placeholder components for other pages
const Standings = ({ darkMode }) => (
  <div className="placeholder-content">
    <h1>Standings</h1>
    <div className="emoji">📊</div>
    <p>Team standings and league tables will be displayed here.</p>
  </div>
);

const Players = ({ darkMode }) => (
  <div className="placeholder-content">
    <h1>Players</h1>
    <div className="emoji">👥</div>
    <p>Player stats, rosters, and profiles will be displayed here.</p>
  </div>
);

const App = () => {
  const [darkMode, setDarkMode] = useState(() => {
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Listen for system dark mode changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => setDarkMode(e.matches);
    mediaQuery.addListener(handleChange);
    
    return () => mediaQuery.removeListener(handleChange);
  }, []);

  return (
    <Router>
      <style>{styles}</style>
      <div className={`mlb-app ${darkMode ? 'dark' : 'light'}`}>
        {/* Header */}
        <header className={`header ${darkMode ? 'dark' : 'light'}`}>
          <div className="header-content">
            {/* Logo */}
            <div className="logo-section">
              <div className="logo">
                ⚾ MLB Scoreboard
              </div>
            </div>

            {/* Navigation - Desktop */}
            <Navigation darkMode={darkMode} />

            {/* Controls */}
            <div className="controls">
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
            <Route path="/" element={<Home darkMode={darkMode} />} />
            <Route path="/standings" element={<Standings darkMode={darkMode} />} />
            <Route path="/players" element={<Players darkMode={darkMode} />} />
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
    </Router>
  );
};

export default App;