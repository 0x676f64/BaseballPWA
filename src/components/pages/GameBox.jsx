import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const GameBox = ({ darkMode }) => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const gamePk = searchParams.get('gamePk');
  
  const [gameData, setGameData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('live');

  // Fetch game data
  useEffect(() => {
    if (!gamePk) return;
    
    const fetchGameData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`https://statsapi.mlb.com/api/v1.1/game/${gamePk}/feed/live`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        setGameData(data);
        
        // Set initial tab based on game state
        const detailedState = data.gameData?.status?.detailedState;
        if (detailedState === 'Pre-Game' || detailedState === 'Scheduled') {
          setActiveTab('pregame');
        } else if (detailedState === 'Final' || detailedState === 'Game Over' || detailedState === 'Completed Early') {
          setActiveTab('wrap');
        } else {
          setActiveTab('live');
        }
        
      } catch (err) {
        console.error('Error fetching game data:', err);
        setError('Failed to load game data');
      } finally {
        setLoading(false);
      }
    };

    fetchGameData();
    
    // Auto-refresh for live games
    const interval = setInterval(() => {
      if (gameData?.gameData?.status?.detailedState === 'In Progress') {
        fetchGameData();
      }
    }, 30000);
    
    return () => clearInterval(interval);
  }, [gamePk]);

  // Get team logo URL
  const getTeamLogoUrl = (teamId, isDark = false) => {
    return isDark 
      ? `https://www.mlbstatic.com/team-logos/team-cap-on-dark/${teamId}.svg`
      : `https://www.mlbstatic.com/team-logos/${teamId}.svg`;
  };

  // Get player headshot URL
  const getPlayerHeadshotUrl = (playerId) => {
    return `https://img.mlbstatic.com/mlb-photos/image/upload/d_people:generic:headshot:67:current.png/w_213,q_auto:best/v1/people/${playerId}/headshot/67/current`;
  };

  // Format batting average
  const formatAvg = (avg) => {
    if (!avg && avg !== 0) return '.---';
    return avg.toFixed(3).substring(1); // Remove leading 0
  };

  // Format ERA
  const formatERA = (era) => {
    if (!era && era !== 0) return '-.--';
    return era.toFixed(2);
  };

  // Bases and Outs SVG Component (copied from Default.jsx)
  const BasesOutsSVG = ({ bases, outs }) => (
    <svg className="bases-outs-svg-box" viewBox="0 0 58 79" fill="none" xmlns="http://www.w3.org/2000/svg">
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

  // Pre-Game Component
  const PreGameView = () => {
    const homeTeam = gameData?.gameData?.teams?.home;
    const awayTeam = gameData?.gameData?.teams?.away;
    const probablePitchers = gameData?.gameData?.probablePitchers;
    const lineups = gameData?.liveData?.boxscore?.teams;

    return (
      <div className="pregame-container">
        {/* Probable Pitchers */}
        <div className="probable-pitchers">
          <h2>Probable Pitchers</h2>
          <div className="pitchers-grid">
            {probablePitchers?.away && (
              <div className="pitcher-card">
                <img 
                  src={getPlayerHeadshotUrl(probablePitchers.away.id)} 
                  alt={probablePitchers.away.fullName}
                  className="pitcher-image"
                />
                <h3>{probablePitchers.away.fullName}</h3>
                <p>{awayTeam?.name}</p>
                <div className="pitcher-stats">
                  <span>ERA: {formatERA(probablePitchers.away.stats?.[0]?.stats?.era)}</span>
                  <span>W-L: {probablePitchers.away.stats?.[0]?.stats?.wins}-{probablePitchers.away.stats?.[0]?.stats?.losses}</span>
                </div>
              </div>
            )}
            
            {probablePitchers?.home && (
              <div className="pitcher-card">
                <img 
                  src={getPlayerHeadshotUrl(probablePitchers.home.id)} 
                  alt={probablePitchers.home.fullName}
                  className="pitcher-image"
                />
                <h3>{probablePitchers.home.fullName}</h3>
                <p>{homeTeam?.name}</p>
                <div className="pitcher-stats">
                  <span>ERA: {formatERA(probablePitchers.home.stats?.[0]?.stats?.era)}</span>
                  <span>W-L: {probablePitchers.home.stats?.[0]?.stats?.wins}-{probablePitchers.home.stats?.[0]?.stats?.losses}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Lineups */}
        <div className="lineups-section">
          <div className="lineups-grid">
            {/* Away Lineup */}
            <div className="lineup-column">
              <h3>{awayTeam?.name} Lineup</h3>
              {lineups?.away?.battingOrder?.map((playerId, index) => {
                const player = lineups.away.players[`ID${playerId}`];
                const stats = player?.seasonStats?.batting;
                
                return (
                  <div key={playerId} className="lineup-player">
                    <div className="player-info">
                      <img 
                        src={getPlayerHeadshotUrl(playerId)} 
                        alt={player?.person?.fullName}
                        className="player-image"
                      />
                      <div className="player-details">
                        <span className="player-name">{player?.person?.fullName}</span>
                        <span className="player-position">{player?.position?.abbreviation} • {player?.person?.batSide?.code}</span>
                      </div>
                    </div>
                    
                    <div className="player-stats">
                      <div className="stat-bar">
                        <label>Season AVG</label>
                        <div className="progress-bar">
                          <div 
                            className="progress-fill" 
                            style={{ width: `${Math.min((stats?.avg || 0) * 100, 100)}%` }}
                          ></div>
                          <span className="stat-value">{formatAvg(stats?.avg)}</span>
                        </div>
                      </div>
                      
                      <div className="stat-bar">
                        <label>Last 7 Games</label>
                        <div className="progress-bar">
                          <div 
                            className="progress-fill" 
                            style={{ width: `${Math.min((stats?.avg || 0) * 100, 100)}%` }}
                          ></div>
                          <span className="stat-value">{formatAvg(stats?.avg)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Home Lineup */}
            <div className="lineup-column">
              <h3>{homeTeam?.name} Lineup</h3>
              {lineups?.home?.battingOrder?.map((playerId, index) => {
                const player = lineups.home.players[`ID${playerId}`];
                const stats = player?.seasonStats?.batting;
                
                return (
                  <div key={playerId} className="lineup-player">
                    <div className="player-info">
                      <img 
                        src={getPlayerHeadshotUrl(playerId)} 
                        alt={player?.person?.fullName}
                        className="player-image"
                      />
                      <div className="player-details">
                        <span className="player-name">{player?.person?.fullName}</span>
                        <span className="player-position">{player?.position?.abbreviation} • {player?.person?.batSide?.code}</span>
                      </div>
                    </div>
                    
                    <div className="player-stats">
                      <div className="stat-bar">
                        <label>Season AVG</label>
                        <div className="progress-bar">
                          <div 
                            className="progress-fill" 
                            style={{ width: `${Math.min((stats?.avg || 0) * 100, 100)}%` }}
                          ></div>
                          <span className="stat-value">{formatAvg(stats?.avg)}</span>
                        </div>
                      </div>
                      
                      <div className="stat-bar">
                        <label>Last 7 Games</label>
                        <div className="progress-bar">
                          <div 
                            className="progress-fill" 
                            style={{ width: `${Math.min((stats?.avg || 0) * 100, 100)}%` }}
                          ></div>
                          <span className="stat-value">{formatAvg(stats?.avg)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Live Game View
  const LiveView = () => {
    const homeTeam = gameData?.gameData?.teams?.home;
    const awayTeam = gameData?.gameData?.teams?.away;
    const linescore = gameData?.liveData?.linescore;
    const currentPlay = gameData?.liveData?.plays?.currentPlay;
    const allPlays = gameData?.liveData?.plays?.allPlays || [];
    
    // Get current batter and pitcher
    const offense = linescore?.offense;
    const defense = linescore?.defense;
    const currentBatter = offense?.batter;
    const currentPitcher = defense?.pitcher;
    
    // Get bases and outs
    const bases = {
      first: !!offense?.first,
      second: !!offense?.second,
      third: !!offense?.third
    };
    const outs = linescore?.outs || 0;
    
    // Get current inning
    const inningHalf = linescore?.inningHalf === 'Top' ? 'TOP' : 'BOT';
    const currentInning = linescore?.currentInning || 1;
    
    // Get team records
    const homeRecord = `${homeTeam?.record?.wins}-${homeTeam?.record?.losses}`;
    const awayRecord = `${awayTeam?.record?.wins}-${awayTeam?.record?.losses}`;
    
    // Get current pitch info
    const lastPitch = currentPlay?.playEvents?.slice(-1)[0];
    
    return (
      <div className="live-container">
        {/* Team Headers with Current Players */}
        <div className="teams-header">
          <div className="team-section">
            <img 
              src={getTeamLogoUrl(awayTeam?.id, darkMode)} 
              alt={awayTeam?.name}
              className="team-logo-large"
            />
            <div className="team-record">{awayRecord}</div>
            {linescore?.inningHalf === 'Top' ? (
              <div className="current-player">
                <h4>Batting</h4>
                <p className="player-name-truncate">{currentBatter?.fullName}</p>
                <div className="player-stats">
                  <span>AVG: {formatAvg(currentBatter?.stats?.batting?.avg)}</span>
                  <span>OPS: {currentBatter?.stats?.batting?.ops?.toFixed(3) || '.000'}</span>
                  <span>HR: {currentBatter?.stats?.batting?.homeRuns || 0}</span>
                </div>
              </div>
            ) : (
              <div className="current-player">
                <h4>Pitching</h4>
                <p className="player-name-truncate">{currentPitcher?.fullName}</p>
                <div className="player-stats">
                  <span>ERA: {formatERA(currentPitcher?.stats?.pitching?.era)}</span>
                  <span>IP: {currentPitcher?.stats?.pitching?.inningsPitched || '0.0'}</span>
                  <span>K: {currentPitcher?.stats?.pitching?.strikeOuts || 0}</span>
                </div>
              </div>
            )}
          </div>
          
          <div className="inning-display">
            <div className="inning-text">{inningHalf} {currentInning}</div>
          </div>
          
          <div className="team-section">
            <img 
              src={getTeamLogoUrl(homeTeam?.id, darkMode)} 
              alt={homeTeam?.name}
              className="team-logo-large"
            />
            <div className="team-record">{homeRecord}</div>
            {linescore?.inningHalf === 'Bottom' ? (
              <div className="current-player">
                <h4>Batting</h4>
                <p className="player-name-truncate">{currentBatter?.fullName}</p>
                <div className="player-stats">
                  <span>AVG: {formatAvg(currentBatter?.stats?.batting?.avg)}</span>
                  <span>OPS: {currentBatter?.stats?.batting?.ops?.toFixed(3) || '.000'}</span>
                  <span>HR: {currentBatter?.stats?.batting?.homeRuns || 0}</span>
                </div>
              </div>
            ) : (
              <div className="current-player">
                <h4>Pitching</h4>
                <p className="player-name-truncate">{currentPitcher?.fullName}</p>
                <div className="player-stats">
                  <span>ERA: {formatERA(currentPitcher?.stats?.pitching?.era)}</span>
                  <span>IP: {currentPitcher?.stats?.pitching?.inningsPitched || '0.0'}</span>
                  <span>K: {currentPitcher?.stats?.pitching?.strikeOuts || 0}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Scorebug */}
        <div className="scorebug-section">
          <BasesOutsSVG bases={bases} outs={outs} />
        </div>

        {/* Current Pitch */}
        {lastPitch && (
          <div className="current-pitch">
            <h4>Last Pitch</h4>
            <div className="pitch-info">
              <span>{currentPitcher?.fullName?.split(' ').map((name, i) => i === 0 ? name[0] + '.' : name).join(' ')}</span>
              <span>{lastPitch.details?.type?.description || 'Unknown'}</span>
              <span>{lastPitch.pitchData?.startSpeed ? `${lastPitch.pitchData.startSpeed.toFixed(1)} mph` : '--'}</span>
              <span>{lastPitch.pitchData?.breaks?.spinRate ? `${lastPitch.pitchData.breaks.spinRate} rpm` : '--'}</span>
            </div>
          </div>
        )}

        {/* Pitch by Pitch */}
        <div className="pitch-by-pitch">
          <h4>Recent Plays</h4>
          <div className="plays-list">
            {allPlays.slice(-10).reverse().map((play, index) => {
              const batter = play.matchup?.batter;
              const lastEvent = play.playEvents?.slice(-1)[0];
              const hitData = lastEvent?.hitData;
              
              return (
                <div key={index} className="play-item">
                  <img 
                    src={getPlayerHeadshotUrl(batter?.id)} 
                    alt={batter?.fullName}
                    className="batter-image-small"
                  />
                  <div className="play-details">
                    <div className="play-result">{lastEvent?.details?.description || play.result?.description}</div>
                    <div className="play-description">{play.result?.description}</div>
                    {hitData && (
                      <div className="hit-data">
                        <span>Exit Velo: {hitData.launchSpeed ? `${hitData.launchSpeed.toFixed(1)} mph` : '--'}</span>
                        <span>Launch Angle: {hitData.launchAngle ? `${hitData.launchAngle.toFixed(1)}°` : '--'}</span>
                        <span>Distance: {hitData.totalDistance ? `${hitData.totalDistance} ft` : '--'}</span>
                      </div>
                    )}
                    {!hitData && (
                      <div className="hit-data">
                        <span>Exit Velo: --</span>
                        <span>Launch Angle: --</span>
                        <span>Distance: --</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  // Post Game Wrap View
  const WrapView = () => {
    const decisions = gameData?.liveData?.decisions;
    const boxscore = gameData?.liveData?.boxscore;
    
    return (
      <div className="wrap-container">
        {/* Decisions */}
        <div className="decisions-section">
          <div className="decision">
            <h4>Winning Pitcher</h4>
            {decisions?.winner && (
              <>
                <img 
                  src={getPlayerHeadshotUrl(decisions.winner.id)} 
                  alt={decisions.winner.fullName}
                  className="decision-image"
                />
                <p>{decisions.winner.fullName}</p>
                <span>{formatERA(decisions.winner.stats?.pitching?.era)} ERA</span>
              </>
            )}
          </div>
          
          <div className="decision">
            <h4>Losing Pitcher</h4>
            {decisions?.loser && (
              <>
                <img 
                  src={getPlayerHeadshotUrl(decisions.loser.id)} 
                  alt={decisions.loser.fullName}
                  className="decision-image"
                />
                <p>{decisions.loser.fullName}</p>
                <span>{formatERA(decisions.loser.stats?.pitching?.era)} ERA</span>
              </>
            )}
          </div>
        </div>

        {/* Top Performers */}
        <div className="performers-section">
          <h4>Top Performers</h4>
          <div className="performers-grid">
            {/* This would need more complex logic to determine top performers */}
            {/* For now, showing save pitcher if available */}
            {decisions?.save && (
              <div className="performer">
                <img 
                  src={getPlayerHeadshotUrl(decisions.save.id)} 
                  alt={decisions.save.fullName}
                  className="performer-image"
                />
                <p>{decisions.save.fullName}</p>
                <span>Save</span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Box Score View (placeholder)
  const BoxScoreView = () => (
    <div className="boxscore-container">
      <h3>Box Score</h3>
      <p>Box score content coming soon...</p>
    </div>
  );

  // Scoring Plays View (placeholder)
  const ScoringPlaysView = () => (
    <div className="scoring-plays-container">
      <h3>Scoring Plays</h3>
      <p>Scoring plays content coming soon...</p>
    </div>
  );

  // All Plays View (placeholder)
  const AllPlaysView = () => (
    <div className="all-plays-container">
      <h3>All Plays</h3>
      <p>All plays content coming soon...</p>
    </div>
  );

  if (loading) {
    return (
      <div className={`page-container ${darkMode ? 'dark' : 'light'}`}>
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading game data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`page-container ${darkMode ? 'dark' : 'light'}`}>
        <div className="loading-container">
          <p style={{color: '#ef4444'}}>{error}</p>
          <button onClick={() => navigate('/')} className="back-button">
            <ArrowLeft /> Back to Games
          </button>
        </div>
      </div>
    );
  }

  if (!gameData) {
    return (
      <div className={`page-container ${darkMode ? 'dark' : 'light'}`}>
        <p>No game data found</p>
      </div>
    );
  }

  const detailedState = gameData.gameData?.status?.detailedState;
  const isPreGame = detailedState === 'Pre-Game' || detailedState === 'Scheduled';
  const isLive = detailedState === 'In Progress';
  const isPostGame = detailedState === 'Final' || detailedState === 'Game Over' || detailedState === 'Completed Early';

  // Determine available tabs
  const getAvailableTabs = () => {
    const baseTabs = ['boxscore', 'scoring-plays', 'all-plays'];
    
    if (isPreGame) {
      return ['pregame', ...baseTabs];
    } else if (isLive) {
      return ['live', ...baseTabs];
    } else {
      return ['wrap', ...baseTabs];
    }
  };

  const availableTabs = getAvailableTabs();

  return (
    <div className={`page-container ${darkMode ? 'dark' : 'light'}`}>
      {/* Header */}
      <div className="gamebox-header">
        <button onClick={() => navigate('/')} className="back-button">
          <ArrowLeft /> Back
        </button>
        
        <div className="game-title">
          <span>{gameData.gameData?.teams?.away?.name} @ {gameData.gameData?.teams?.home?.name}</span>
          <span className="game-date">{new Date(gameData.gameData?.datetime?.dateTime).toLocaleDateString()}</span>
        </div>
      </div>

      {/* Score display for live/final games */}
      {(isLive || isPostGame) && (
        <div className="score-display">
          {/* Away Team */}
          <div className="team-section-score">
            <img 
              src={getTeamLogoUrl(gameData.gameData?.teams?.away?.id, darkMode)} 
              alt={gameData.gameData?.teams?.away?.name}
              className="team-logo-small"
            />
            <div className="team-record-score">{gameData.gameData?.teams?.away?.record?.wins}-{gameData.gameData?.teams?.away?.record?.losses}</div>
          </div>
          
          {/* Scores */}
          <div className="scores-container">
            <span className="score away-score">{gameData.liveData?.linescore?.teams?.away?.runs || 0}</span>
            <span className="score-separator">-</span>
            <span className="score home-score">{gameData.liveData?.linescore?.teams?.home?.runs || 0}</span>
          </div>
          
          {/* Home Team */}
          <div className="team-section-score">
            <img 
              src={getTeamLogoUrl(gameData.gameData?.teams?.home?.id, darkMode)} 
              alt={gameData.gameData?.teams?.home?.name}
              className="team-logo-small"
            />
            <div className="team-record-score">{gameData.gameData?.teams?.home?.record?.wins}-{gameData.gameData?.teams?.home?.record?.losses}</div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="tabs-container">
        {availableTabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`tab ${activeTab === tab ? 'active' : ''}`}
          >
            {tab === 'pregame' ? 'Pre-Game' : 
             tab === 'live' ? 'Live' :
             tab === 'wrap' ? 'Wrap' :
             tab === 'boxscore' ? 'Box Score' :
             tab === 'scoring-plays' ? 'Scoring Plays' :
             tab === 'all-plays' ? 'All Plays' : tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === 'pregame' && <PreGameView />}
        {activeTab === 'live' && <LiveView />}
        {activeTab === 'wrap' && <WrapView />}
        {activeTab === 'boxscore' && <BoxScoreView />}
        {activeTab === 'scoring-plays' && <ScoringPlaysView />}
        {activeTab === 'all-plays' && <AllPlaysView />}
      </div>
    </div>
  );
};

export default GameBox;