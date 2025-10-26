import React, { useState } from 'react';

function StatCard({ icon, value, label, tooltip }) {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div 
      className="stat-card"
      onMouseEnter={() => tooltip && setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <div className="stat-icon">{icon}</div>
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
      {tooltip && showTooltip && (
        <div className="stat-tooltip">
          {tooltip}
        </div>
      )}
    </div>
  );
}

export default StatCard;