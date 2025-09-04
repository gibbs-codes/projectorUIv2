import React from 'react';
import Zone from './Zone';
import ErrorBoundary from './ErrorBoundary';

const LayoutEngine = ({ profile }) => {
  console.log('🏗️ LAYOUT: LayoutEngine received profile:', profile);
  console.log('🏗️ LAYOUT: Profile validation checks:', {
    hasProfile: !!profile,
    hasGridConfig: !!(profile?.gridConfig),
    zonesIsArray: Array.isArray(profile?.zones),
    profileKeys: profile ? Object.keys(profile) : null,
    gridConfigKeys: profile?.gridConfig ? Object.keys(profile.gridConfig) : null,
    zonesLength: profile?.zones?.length || 0
  });

  if (!profile) {
    console.error('❌ LAYOUT: No profile provided!');
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
          <h2>No Profile Data</h2>
          <p>No profile data was provided to the layout engine.</p>
        </div>
      </div>
    );
  }

  if (!profile.gridConfig) {
    console.error('❌ LAYOUT: Profile missing gridConfig!', profile);
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
          <h2>Missing Grid Configuration</h2>
          <p>The profile is missing required grid configuration.</p>
        </div>
      </div>
    );
  }

  if (!Array.isArray(profile.zones)) {
    console.error('❌ LAYOUT: Profile zones is not an array!', {
      zonesType: typeof profile.zones,
      zones: profile.zones
    });
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
          <h2>Invalid Zones Configuration</h2>
          <p>The profile zones are not properly configured as an array.</p>
        </div>
      </div>
    );
  }

  const { gridConfig } = profile;
  
  console.log('🏗️ LAYOUT: Processing gridConfig:', gridConfig);
  
  const generateGridTemplateAreas = () => {
    console.log('🏗️ LAYOUT: Generating grid template areas from:', gridConfig.areas);
    
    if (!gridConfig.areas || !Array.isArray(gridConfig.areas)) {
      console.warn('⚠️ LAYOUT: No valid grid areas found, using "none"');
      return 'none';
    }
    
    const result = gridConfig.areas
      .map(row => {
        const processedRow = `"${Array.isArray(row) ? row.join(' ') : row}"`;
        console.log('🏗️ LAYOUT: Processing grid row:', row, '→', processedRow);
        return processedRow;
      })
      .join(' ');
    
    console.log('🏗️ LAYOUT: Final grid template areas:', result);
    return result;
  };

  const gridStyle = {
    gridTemplateColumns: gridConfig.columns || '1fr',
    gridTemplateRows: gridConfig.rows || '1fr',
    gridTemplateAreas: generateGridTemplateAreas(),
    gap: gridConfig.gap || '8px',
  };

  console.log('🏗️ LAYOUT: Final grid style:', gridStyle);
  
  console.log('🏗️ LAYOUT: Processing zones:', profile.zones);
  profile.zones.forEach((zone, index) => {
    console.log(`🏗️ LAYOUT: Zone ${index}:`, {
      id: zone?.id,
      name: zone?.name,
      gridArea: zone?.gridArea,
      hasCards: !!zone?.cards,
      cardsCount: zone?.cards?.length || 0,
      zone: zone
    });
  });

  const validZones = profile.zones.filter(zone => {
    const isValid = zone && zone.id && zone.gridArea;
    console.log(`🏗️ LAYOUT: Zone "${zone?.id}" validation:`, {
      hasZone: !!zone,
      hasId: !!(zone?.id),
      hasGridArea: !!(zone?.gridArea),
      isValid
    });
    return isValid;
  });

  console.log('🏗️ LAYOUT: Valid zones after filtering:', validZones.length, 'out of', profile.zones.length);

  if (validZones.length === 0) {
    console.error('❌ LAYOUT: No valid zones found!');
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
          <details style={{ marginTop: '20px', textAlign: 'left' }}>
            <summary>Debug Info</summary>
            <pre style={{ fontSize: '11px', marginTop: '10px' }}>
              {JSON.stringify({
                totalZones: profile.zones.length,
                zones: profile.zones.map(z => ({
                  id: z?.id || 'missing',
                  gridArea: z?.gridArea || 'missing',
                  hasName: !!z?.name
                }))
              }, null, 2)}
            </pre>
          </details>
        </div>
      </div>
    );
  }

  console.log('🏗️ LAYOUT: Rendering layout engine with valid zones');

  return (
    <div 
      className="layout-engine" 
      style={gridStyle}
      data-profile-id={profile.id}
    >
      {validZones.map(zone => {
        console.log(`🏗️ LAYOUT: Rendering Zone component for zone "${zone.id}"`);
        return (
          <ErrorBoundary
            key={zone.id}
            fallback={(error, retry) => (
              <div 
                className="zone" 
                style={{ 
                  gridArea: zone.gridArea,
                  border: '2px dashed #f44336',
                  padding: '20px',
                  backgroundColor: '#ffebee'
                }}
              >
                <div style={{ color: '#f44336', fontWeight: 'bold', marginBottom: '8px' }}>
                  Zone Error: {zone.name || zone.id}
                </div>
                <div style={{ color: '#666', fontSize: '14px', marginBottom: '12px' }}>
                  This zone failed to render due to an error.
                </div>
                <button 
                  onClick={retry}
                  style={{
                    padding: '8px 12px',
                    border: '1px solid #f44336',
                    backgroundColor: 'white',
                    color: '#f44336',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  Retry Zone
                </button>
                {process.env.NODE_ENV === 'development' && (
                  <details style={{ marginTop: '12px' }}>
                    <summary>Error Details</summary>
                    <pre style={{ fontSize: '11px', marginTop: '4px' }}>
                      {error?.toString()}
                    </pre>
                    <pre style={{ fontSize: '11px', marginTop: '4px' }}>
                      Zone data: {JSON.stringify(zone, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            )}
          >
            <Zone zone={zone} />
          </ErrorBoundary>
        );
      })}
    </div>
  );
};

export default LayoutEngine;