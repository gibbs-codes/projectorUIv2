import React from 'react';
import Zone from './Zone';

const LayoutEngine = ({ profile }) => {
  if (!profile || !profile.gridConfig || !Array.isArray(profile.zones)) {
    return (
      <div className="layout-engine" style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        backgroundColor: '#f5f5f5'
      }}>
        <div style={{ 
          textAlign: 'center', 
          color: '#666',
          padding: '40px'
        }}>
          <h2>Invalid Profile Configuration</h2>
          <p>The profile data is missing required grid configuration or zones.</p>
        </div>
      </div>
    );
  }

  const { gridConfig } = profile;
  
  const generateGridTemplateAreas = () => {
    if (!gridConfig.areas || !Array.isArray(gridConfig.areas)) {
      return 'none';
    }
    
    return gridConfig.areas
      .map(row => `"${Array.isArray(row) ? row.join(' ') : row}"`)
      .join(' ');
  };

  const gridStyle = {
    gridTemplateColumns: gridConfig.columns || '1fr',
    gridTemplateRows: gridConfig.rows || '1fr',
    gridTemplateAreas: generateGridTemplateAreas(),
    gap: gridConfig.gap || '8px',
  };

  const validZones = profile.zones.filter(zone => 
    zone && 
    zone.id && 
    zone.gridArea
  );

  if (validZones.length === 0) {
    return (
      <div className="layout-engine" style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        backgroundColor: '#f5f5f5'
      }}>
        <div style={{ 
          textAlign: 'center', 
          color: '#666',
          padding: '40px'
        }}>
          <h2>No Valid Zones</h2>
          <p>No zones with valid configuration found in the profile.</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="layout-engine" 
      style={gridStyle}
      data-profile-id={profile.id}
    >
      {validZones.map(zone => (
        <Zone 
          key={zone.id} 
          zone={zone} 
        />
      ))}
    </div>
  );
};

export default LayoutEngine;