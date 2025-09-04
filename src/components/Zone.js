import React from 'react';
import CardRenderer from './CardRenderer';
import CardErrorBoundary from './CardErrorBoundary';
import { validateCard, logCardAnalysis, logPropsFlow } from '../utils/cardValidation';

const Zone = ({ zone }) => {
  // Log complete props flow
  logPropsFlow('Zone', { zone }, { 
    timestamp: new Date().toISOString(),
    renderingPhase: 'initial'
  });
  
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
  
  // Log detailed cards array information
  console.log('🏢 ZONE: Raw cards array before mapping:', zone.cards);
  console.log('🏢 ZONE: Processed cards array:', cards);
  
  if (cards.length > 0) {
    console.log('🏢 ZONE: Detailed card analysis:');
    cards.forEach((card, index) => {
      console.log(`  Card ${index}:`, {
        hasCard: !!card,
        cardId: card?.id,
        cardType: card?.type,
        cardTitle: card?.title,
        cardKeys: card ? Object.keys(card) : null,
        fullCard: card
      });
    });
  }

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
          console.log(`🏢 ZONE: ========== CARD RENDERING START ==========`);
          console.log(`🏢 ZONE: Zone "${zone.id}" rendering card ${index}:`);
          
          // Comprehensive card analysis
          logCardAnalysis(card, `Zone "${zone.id}" Card ${index}`);
          
          // Detailed validation
          const validation = validateCard(card);
          console.log(`🔍 ZONE: Card validation result:`, validation);
          
          if (!validation.isValid) {
            console.error(`❌ ZONE: Card ${index} validation failed:`, validation.errors);
          }
          
          if (validation.warnings.length > 0) {
            console.warn(`⚠️ ZONE: Card ${index} validation warnings:`, validation.warnings);
          }
          
          console.log(`🏢 ZONE: Card object:`, card);
          console.log(`🏢 ZONE: Card type: "${card?.type}" (${typeof card?.type})`);
          console.log(`🏢 ZONE: Card ID: "${card?.id}" (${typeof card?.id})`);
          console.log(`🏢 ZONE: Card title: "${card?.title}" (${typeof card?.title})`);
          console.log(`🏢 ZONE: Card structure:`, {
            type: card?.type,
            id: card?.id,
            title: card?.title,
            content: card?.content,
            value: card?.value,
            items: card?.items,
            data: card?.data,
            status: card?.status,
            keys: card ? Object.keys(card) : null
          });
          
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

          // Data validation
          const validationErrors = [];
          if (!card.id) validationErrors.push('Missing card.id');
          if (!card.type) validationErrors.push('Missing card.type');
          if (!card.title) validationErrors.push('Missing card.title');
          
          if (validationErrors.length > 0) {
            console.warn(`⚠️ ZONE: Card validation errors for card ${index}:`, validationErrors);
          }

          console.log(`🏢 ZONE: About to pass props to CardRenderer:`, {
            key: card.id || `card-${index}`,
            card: card
          });
          console.log(`🏢 ZONE: Props being passed - card prop:`, card);
          console.log(`🏢 ZONE: ========== CALLING CardRenderer ==========`);

          console.log(`🏢 ZONE: Wrapping CardRenderer in CardErrorBoundary`);
          
          const cardElement = (
            <CardErrorBoundary
              key={card.id || `card-${index}`}
              cardData={card}
              onError={(error, errorInfo, cardData) => {
                console.error(`🛡️ ZONE: CardErrorBoundary caught error for card ${index}:`, {
                  error: error.message,
                  cardId: cardData?.id,
                  cardType: cardData?.type,
                  zoneId: zone.id
                });
              }}
              onRetry={() => {
                console.log(`🛡️ ZONE: Retrying card ${index} in zone "${zone.id}"`);
              }}
            >
              <CardRenderer card={card} />
            </CardErrorBoundary>
          );
          
          console.log(`🏢 ZONE: CardErrorBoundary wrapper created for card ${index}`);
          console.log(`🏢 ZONE: ========== CARD RENDERING END ==========`);
          
          return cardElement;
        })
      )}
    </div>
  );
};

export default Zone;