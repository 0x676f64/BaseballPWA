import React from 'react';

const Teams = ({ darkMode }) => {
  return (
    <div className={`page-container ${darkMode ? 'dark' : 'light'}`}>
      <h1>MLB Teams</h1>
      <p>Teams content coming soon...</p>
    </div>
  );
};

export default Teams;