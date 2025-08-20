import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Calendar, Home, BarChart3, Users, Moon, Sun, RefreshCw, Heart } from 'lucide-react';

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
    min-height: 100dvh; /* Dynamic viewport height for mobile */
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

  .logo img {
    width: 9rem;
    height: 4rem;
    justify-content: flex-start;
  }

  .logo-text h1 {
    font-size: 1.25rem;
    font-weight: bold;
    background: linear-gradient(135deg, #ef4444 0%, #3b82f6 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    margin: 0;
  }

  .logo-text p {
    font-size: 0.75rem;
    opacity: 0.7;
    margin: 0;
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
    padding: 2rem 10rem;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
  }

  .games-grid {
    display: grid;
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
    width: 310px;
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
    width: 50%;
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

  .inning-info {
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--text-primary);
  }

  .count-info {
    font-size: 0.75rem;
    color: var(--text-secondary);
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

  /* Footer Styles */
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

  .mobile-nav {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    backdrop-filter: blur(20px);
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    padding: 0.5rem;
    display: none;
    z-index: 100;
    /* Safe area for iPhone X and newer */
    padding-bottom: max(0.5rem, env(safe-area-inset-bottom));
  }

  .mobile-nav.light {
    background: rgba(255, 255, 255, 0.9);
    border-color: rgba(0, 0, 0, 0.1);
  }

  .mobile-nav.dark {
    background: rgba(17, 24, 39, 0.95);
    border-color: rgba(255, 255, 255, 0.1);
  }

  .nav-items {
    display: flex;
    justify-content: space-around;
    align-items: center;
  }

  .nav-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.25rem;
    padding: 0.5rem;
    border: none;
    background: none;
    cursor: pointer;
    border-radius: 0.5rem;
    transition: all 0.2s ease;
    color: inherit;
  }

  .nav-item svg {
    width: 1.25rem;
    height: 1.25rem;
  }

  .nav-label {
    font-size: 0.75rem;
    font-weight: 500;
  }

  /* Default: hidden (mobile/tablet) */
.nav-links {
  display: none;
}

/* Desktop only (≥1024px) */
@media (min-width: 768px) {
  .nav-links {
    display: flex;
    gap: 2rem; /* space between links */
    align-items: center;
  }

  .nav-link {
    text-decoration: none;
    font-weight: 500;
    transition: color 0.3s ease;
  }

  .nav-link.light {
    color: #1f2937; /* gray-800 */
  }

  .nav-link.dark {
    color: #f9fafb; /* gray-50 */
  }

  .nav-link:hover {
    color: #3b82f6; /* blue-500 hover */
  }
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

  /* Mobile Devices - iPhone, Android phones */
  @media (max-width: 767px) {
    html, body, #root {
      height: 100vh;
      height: 100dvh;
      overflow-x: hidden;
      scroll-bar-width: none;
      width: 100%;
    }

    .mlb-app {
      margin-left: 0;
      width: 100%;
      min-height: 100vh;
      min-height: 100dvh;
      position: relative;
      /* Account for safe areas on modern phones */
      padding-top: env(safe-area-inset-top);
      padding-left: env(safe-area-inset-left);
      padding-right: env(safe-area-inset-right);
    }

    .mobile-nav {
      display: block;
    }
    
    .main-content {
      padding: 1rem;
      padding-bottom: calc(5rem + env(safe-area-inset-bottom));
      flex: 1;
    }

    .header {
      padding: 0.75rem 1rem;
      /* Account for notches and status bars */
      padding-top: max(0.75rem, env(safe-area-inset-top));
    }

    .header-content {
      flex-direction: column;
      justify-content: center;
      align-items: center;
      gap: 0.75rem;
      margin-top: 0.5rem;
      margin-bottom: 0.5rem;
    }

    .logo-section {
      justify-content: center;
    }

    .logo img {
      width: 8rem;
      height: auto;
    }

    .controls {
      margin-top: 1rem;
      gap: 0.5rem;
      flex-wrap: wrap;
      justify-content: center;
    }

    .games-grid {
      grid-template-columns: 1fr;
      gap: 1rem;
    }

    .game-card {
      width: 100%;
      padding: 1rem;
    }

    .footer {
      padding: 1.5rem 1rem;
      padding-bottom: calc(1.5rem + env(safe-area-inset-bottom));
    }

    .footer-links {
      gap: 1.5rem;
      flex-direction: column;
      text-align: center;
    }

    .footer-content {
      gap: 0.75rem;
    }
  }

  /* Tablet Portrait - iPad, iPad Mini */
  @media (min-width: 768px) and (max-width: 1023px) {
    .mlb-app {
      margin-left: 0;
      width: 100%;
    }

    .main-content {
      padding: 2rem;
    }

    .games-grid {
      grid-template-columns: repeat(2, 1fr);
      gap: 1.25rem;
      justify-items: center;
    }

    .game-card {
      flex: 1 1 auto;
      width: clamp(330px, 42vw, 380px);
      margin: 0.5rem; 
    }

    .header-content {
      flex-wrap: wrap;
      justify-content: space-between;
    }

    .controls {
      gap: 0.75rem;
    }
  }

  /* Desktop Small - iPad Air landscape, small laptops */
  @media (min-width: 1024px) and (max-width: 1279px) {
    .mlb-app {
      margin-left: 0;
      width: 100%;
    }

    .main-content {
      padding: 2rem 4rem;
    }

    .games-grid {
      grid-template-columns: repeat(3, 1fr);
      gap: 1.5rem;
      justify-items: center;
    }

    .game-card {
      width: 100%;
      max-width: 320px;
    }
  }

  /* Desktop Large */
  @media (min-width: 1280px) and (max-width: 1599px) {
    .games-grid {
      grid-template-columns: repeat(4, 1fr);
      gap: 1.5rem;
      justify-items: center;
    }

    .game-card {
      width: 100%;
      max-width: 300px;
    }
  }

  /* Extra Large Screens */
  @media (min-width: 1600px) {
    .games-grid {
      grid-template-columns: repeat(4, 1fr);
      gap: 2rem;
      justify-items: center;
    }

    .game-card {
      width: 100%;
      max-width: 380px;
    }
  }

  /* iPhone SE and smaller screens */
  @media (max-width: 375px) {
    .header-content {
      gap: 0.5rem;
    }

    .logo img {
      width: 6rem;
    }

    .controls {
      margin-top: 0.5rem;
      gap: 0.25rem;
    }

    .main-content {
      padding: 0.75rem;
    }

    .game-card {
      padding: 0.75rem;
    }
  }

  /* Landscape orientation for phones */
  @media (max-width: 896px) and (orientation: landscape) {
    .mlb-app {
      padding-left: env(safe-area-inset-left);
      padding-right: env(safe-area-inset-right);
    }

    .header {
      padding-top: 0.5rem;
      padding-bottom: 0.5rem;
    }

    .header-content {
      flex-direction: row;
      gap: 1rem;
    }

    .main-content {
      padding: 1rem;
      padding-bottom: calc(4rem + env(safe-area-inset-bottom));
    }

    .games-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }
`;

const MLBScoreboard = () => {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(() => {
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  const [selectedDate, setSelectedDate] = useState('');
  const [activeTab, setActiveTab] = useState('home');
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
      setIsRefreshing(false);
    }
  }, []);

  // Initialize app
  useEffect(() => {
    const today = getCurrentBaseballDate();
    setSelectedDate(today);
    fetchGameData(today);

    // Listen for system dark mode changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => setDarkMode(e.matches);
    mediaQuery.addListener(handleChange);
    
    return () => mediaQuery.removeListener(handleChange);
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
      onClick={() => window.open(`https://www.mlb.com/gameday/${game.gamePk}`, '_blank')}
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
      <style>{styles}</style>
      <div className={`mlb-app ${darkMode ? 'dark' : 'light'}`}>
        {/* Header */}
        <header className={`header ${darkMode ? 'dark' : 'light'}`}>
          <div className="header-content">
            {/* Logo */}
            <div className="logo-section">
              <div className="logo">
                <img src="assets/Major_League_Baseball_logo.svg" alt="MLB Logo" />
              </div>
            </div>

             {/* Navigation */}
            <nav className="nav-links">
              <a href="#home" className={`nav-link ${darkMode ? 'dark' : 'light'}`}>Home</a>
              <a href="#standings" className={`nav-link ${darkMode ? 'dark' : 'light'}`}>Standings</a>
              <a href="#stats" className={`nav-link ${darkMode ? 'dark' : 'light'}`}>Stats</a>
              <a href="#players" className={`nav-link ${darkMode ? 'dark' : 'light'}`}>Players</a>
            </nav>

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
                onClick={() => fetchGameData(selectedDate, true)}
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

        {/* Main content */}
        <main className="main-content">
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
      </div>
    </>
  );
};

export default MLBScoreboard;