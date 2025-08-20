import React from 'react';

const Standings = ({ darkMode }) => {
  return (
    <div className={`page-container ${darkMode ? 'dark' : 'light'}`}>
      <h1>MLB Standings</h1>
      <p>Standings content coming soon...</p>
    </div>
  );
};

export default Standings;