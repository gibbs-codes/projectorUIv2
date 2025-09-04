import React from 'react';
import CardRenderer from './CardRenderer';

const Zone = ({ zone }) => {
  console.log('🏢 ZONE: Rendering zone:', zone);
  
  if (!zone) {
    console.error('❌ ZONE: No zone data provided');
    return (
      <div className="zone" style={{ borderColor: '#f44336', padding: '20px' }}>
        <div className="zone-title" style={{ color: '#f44336' }}>
          Invalid Zone
        </div>
        <div style={{ color: '#666', fontSize: '14px' }}>
          Zone data is missing or invalid
        </div>
      </div>
    );
  }

  console.log('🏢 ZONE: Zone validation:', {
    id: zone.id,
    name: zone.name,
    gridArea: zone.gridArea,
    hasCards: !!zone.cards,
    cardsType: typeof zone.cards,
    cardsIsArray: Array.isArray(zone.cards),
    cardsLength: zone.cards?.length || 0
  });

  if (!zone.id) {
    console.error('❌ ZONE: Zone missing ID');
  }
  
  if (!zone.gridArea) {
    console.error('❌ ZONE: Zone missing gridArea');
  }

  const cards = Array.isArray(zone.cards) ? zone.cards : [];
  console.log(`🏢 ZONE: Zone "${zone.id}" has ${cards.length} cards to render`);

  return (
    <div 
      className="zone" 
      style={{ gridArea: zone.gridArea }}
      data-zone-id={zone.id}
    >
      {zone.name && (
        <div className="zone-title">
          {zone.name}
        </div>
      )}
      
      {cards.length === 0 ? (
        <div style={{ 
          color: '#999', 
          fontSize: '14px', 
          fontStyle: 'italic',
          textAlign: 'center',
          padding: '20px'
        }}>
          No cards configured for this zone
          {process.env.NODE_ENV === 'development' && (
            <div style={{ fontSize: '12px', marginTop: '8px', fontFamily: 'monospace' }}>
              Zone ID: {zone.id}<br/>
              Original cards data: {JSON.stringify(zone.cards)}
            </div>
          )}
        </div>
      ) : (
        cards.map((card, index) => {
          console.log(`🏢 ZONE: Rendering card ${index} in zone "${zone.id}":`, card);
          
          if (!card) {
            console.error(`❌ ZONE: Card at index ${index} is null/undefined in zone "${zone.id}"`);
            return (
              <div key={`error-card-${index}`} style={{
                border: '2px dashed #f44336',
                padding: '16px',
                margin: '8px 0',
                borderRadius: '4px',
                backgroundColor: '#ffebee'
              }}>
                <div style={{ color: '#f44336', fontWeight: 'bold' }}>
                  Card Error
                </div>
                <div style={{ color: '#666', fontSize: '14px' }}>
                  Card at position {index} is missing or invalid
                </div>
              </div>
            );
          }

          if (!card.id) {
            console.warn(`⚠️ ZONE: Card at index ${index} missing ID in zone "${zone.id}"`);
          }

          try {
            return (
              <CardRenderer 
                key={card.id || `card-${index}`} 
                card={card} 
              />
            );
          } catch (error) {
            console.error(`❌ ZONE: Error rendering card in zone "${zone.id}":`, error);
            return (
              <div key={`error-card-${card.id || index}`} style={{
                border: '2px dashed #f44336',
                padding: '16px',
                margin: '8px 0',
                borderRadius: '4px',
                backgroundColor: '#ffebee'
              }}>
                <div style={{ color: '#f44336', fontWeight: 'bold' }}>
                  Card Render Error
                </div>
                <div style={{ color: '#666', fontSize: '14px' }}>
                  Failed to render card: {error.message}
                </div>
                {process.env.NODE_ENV === 'development' && (
                  <details style={{ marginTop: '8px' }}>
                    <summary>Card Data</summary>
                    <pre style={{ fontSize: '11px', marginTop: '4px' }}>
                      {JSON.stringify(card, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            );
          }
        })
      )}
    </div>
  );
};

export default Zone;