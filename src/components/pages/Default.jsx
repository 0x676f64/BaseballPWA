import React, { useState, useEffect, useCallback } from 'react';
import { Home, BarChart3, Users } from 'lucide-react';
import { useNavigate } from "react-router-dom";

const Default = ({ 
  darkMode, 
  selectedDate, 
  onDateChange, 
  isRefreshing, 
  onRefreshComplete 
}) => {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('home');
  const [error, setError] = useState(null);
  const navigate = useNavigate();

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
        
        // Get additional live data for scorebug
        const plays = data.liveData?.plays;
        const count = plays?.currentPlay?.count || { balls: 0, strikes: 0, outs: 0 };
        
        // Get base occupancy from linescore.offense
        const offense = linescore.offense || {};
        const basesOccupied = {
          first: !!offense.first,   // Check if first base data exists
          second: !!offense.second, // Check if second base data exists  
          third: !!offense.third    // Check if third base data exists
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
    if (!showRefresh) setLoading(true);
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

      // Sort games: Live first, then scheduled by time, then final
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
      if (onRefreshComplete) onRefreshComplete();
    }
  }, [onRefreshComplete]);

  // Handle refresh from parent
  useEffect(() => {
    if (isRefreshing && selectedDate) {
      fetchGameData(selectedDate, true);
    }
  }, [isRefreshing, selectedDate, fetchGameData]);

  // Handle date change from parent
  useEffect(() => {
    if (selectedDate) {
      fetchGameData(selectedDate);
    }
  }, [selectedDate, fetchGameData]);

  // Initialize with current date if no date provided
  useEffect(() => {
    if (!selectedDate) {
      const today = getCurrentBaseballDate();
      if (onDateChange) {
        onDateChange(today);
      }
    }
  }, [selectedDate, getCurrentBaseballDate, onDateChange]);

  // Auto-refresh for today's games
  useEffect(() => {
    if (selectedDate === getCurrentBaseballDate()) {
      const interval = setInterval(() => {
        fetchGameData(selectedDate, true);
      }, 30000);
      
      return () => clearInterval(interval);
    }
  }, [selectedDate, getCurrentBaseballDate, fetchGameData]);

  // Get team logo URL
  const getTeamLogoUrl = (teamId, isDark = false) => {
    return isDark 
      ? `https://www.mlbstatic.com/team-logos/team-cap-on-dark/${teamId}.svg`
      : `https://www.mlbstatic.com/team-logos/${teamId}.svg`;
  };

  // Bases and Outs SVG Component
  const BasesOutsSVG = ({ bases, outs }) => (
    <svg className="bases-outs-svg" viewBox="0 0 58 79" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Outs circles */}
      <circle cx="13" cy="61.5" r="6" className={`out-circle ${outs >= 1 ? 'filled' : ''}`} strokeWidth="1"/>
      <circle cx="30" cy="61.5" r="6" className={`out-circle ${outs >= 2 ? 'filled' : ''}`} strokeWidth="1"/>
      <circle cx="47" cy="61.5" r="6" className={`out-circle ${outs >= 3 ? 'filled' : ''}`} strokeWidth="1"/>
      
      {/* Bases */}
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
      onClick={() => navigate(`/gamebox?gamePk=${game.gamePk}`)}
      style={{ cursor: 'pointer' }}
    >
      {/* Live indicator */}
      {game.isLive && (
        <div className="live-indicator">
          <div className="live-dot"></div>
          <span className="live-text">Live</span>
        </div>
      )}
      
      {/* Game status */}
      <div className={`game-status ${
        game.isLive ? 'live' : game.isFinal ? 'final' : 'scheduled'
      }`}>
        {game.status}
      </div>

      {/* Teams */}
      <div className="teams-container">
        {/* Away team */}
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

        {/* Home team */}
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

      {/* Scorebug - only show for live games */}
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
      {/* Loading state */}
      {loading && (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading games...</p>
        </div>
      )}

      {/* Error state */}
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

      {/* Games grid */}
      {!loading && !error && (
        <>
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

      {/* Bottom navigation for mobile */}
      <nav className={`mobile-nav ${darkMode ? 'dark' : 'light'}`}>
        <div className="nav-items">
          {[
            { id: 'home', icon: Home, label: 'Home' },
            { id: 'standings', icon: BarChart3, label: 'Standings' },
            { id: 'stats', icon: BarChart3, label: 'Stats' },
            { id: 'players', icon: Users, label: 'Players' },
          ].map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className="nav-item"
              style={{
                color: activeTab === id ? '#3b82f6' : 'inherit',
                background: activeTab === id ? 'rgba(59, 130, 246, 0.1)' : 'transparent'
              }}
            >
              <Icon />
              <span className="nav-label">{label}</span>
            </button>
          ))}
        </div>
      </nav>
    </>
  );
};

export default Default;