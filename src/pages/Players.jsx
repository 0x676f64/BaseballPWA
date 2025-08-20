import React from 'react';

const Players = ({ darkMode }) => {
  return (
    <div className={`page-container ${darkMode ? 'dark' : 'light'}`}>
      <h1>MLB Players</h1>
      <p>Players content coming soon...</p>
    </div>
  );
};

export default Players;