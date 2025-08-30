import React from 'react';
import CardRenderer from './CardRenderer';

const Zone = ({ zone }) => {
  if (!zone) {
    return (
      <div className="zone" style={{ borderColor: '#f44336' }}>
        <div className="zone-title" style={{ color: '#f44336' }}>
          Invalid Zone
        </div>
        <div style={{ color: '#666', fontSize: '14px' }}>
          Zone data is missing or invalid
        </div>
      </div>
    );
  }

  const cards = Array.isArray(zone.cards) ? zone.cards : [];

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
        </div>
      ) : (
        cards.map((card, index) => (
          <CardRenderer 
            key={card.id || `card-${index}`} 
            card={card} 
          />
        ))
      )}
    </div>
  );
};

export default Zone;