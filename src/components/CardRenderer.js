import React from 'react';
import { validateCard, logPropsFlow } from '../utils/cardValidation';

// Debug test function to verify all card types work
const testAllCardTypes = () => {
  console.log('🧪 DEBUG TEST: Testing all card types...');
  
  const testCards = [
    { id: 'test-text', type: 'text', title: 'Test Text', content: 'Test content' },
    { id: 'test-status', type: 'status', title: 'Test Status', status: 'online', message: 'Test message' },
    { id: 'test-info', type: 'info', title: 'Test Info', items: ['item1', 'item2'] },
    { id: 'test-chart', type: 'chart', title: 'Test Chart', data: [1, 2, 3] },
    { id: 'test-metric', type: 'metric', title: 'Test Metric', value: 42, unit: 'units' },
    { id: 'test-image', type: 'image', title: 'Test Image', imageUrl: 'test.jpg' }
  ];
  
  testCards.forEach(card => {
    console.log(`🧪 Testing ${card.type} card:`, card);
    try {
      // Test type conversion and comparison
      const cardType = card.type.toLowerCase();
      console.log(`🧪 Type "${card.type}" → "${cardType}"`);
      console.log(`🧪 Matches text: ${cardType === 'text'}`);
      console.log(`🧪 Matches status: ${cardType === 'status'}`);
      console.log(`🧪 Matches info: ${cardType === 'info'}`);
      console.log(`🧪 Matches chart: ${cardType === 'chart'}`);
      console.log(`🧪 Matches metric: ${cardType === 'metric'}`);
      console.log(`🧪 Matches image: ${cardType === 'image'}`);
    } catch (error) {
      console.error(`🧪 Error testing ${card.type}:`, error);
    }
  });
};

// Run test once when module loads (only in development)
if (process.env.NODE_ENV === 'development') {
  testAllCardTypes();
  
  // Make debugging functions available globally for console testing
  window.debugCardRenderer = {
    testAllCardTypes,
    testCard: (card) => {
      console.log('🧪 Manual card test:', card);
      return CardRenderer({ card });
    },
    createTestCard: (type, title = 'Test') => ({
      id: `debug-${type}-${Date.now()}`,
      type,
      title,
      content: 'Test content',
      status: 'online',
      items: ['test item'],
      data: [1, 2, 3],
      value: 42,
      imageUrl: 'test.jpg'
    })
  };
  
  console.log('🧪 Debug functions available on window.debugCardRenderer');
}

const TextCard = ({ card }) => {
  console.log('📝 CARD: ========== TextCard START ==========');
  console.log('📝 CARD: TextCard function called');
  console.log('📝 CARD: TextCard received props:', arguments);
  console.log('📝 CARD: TextCard card prop:', card);
  console.log('📝 CARD: TextCard rendering with:', { 
    title: card.title, 
    content: card.content,
    hasTitle: !!card.title,
    hasContent: !!card.content,
    fullCard: card
  });
  
  const element = (
    <div className="card" style={{ borderLeftColor: '#007bff' }}>
      <div className="card-title">{card.title || 'Text Card'}</div>
      <div className="card-content">
        {card.content || 'No content available'}
      </div>
    </div>
  );
  
  console.log('📝 CARD: TextCard element created:', element);
  console.log('📝 CARD: ========== TextCard END ==========');
  
  return element;
};

const StatusCard = ({ card }) => {
  console.log('🚦 CARD: ========== StatusCard START ==========');
  console.log('🚦 CARD: StatusCard function called');
  console.log('🚦 CARD: StatusCard received props:', arguments);
  console.log('🚦 CARD: StatusCard card prop:', card);
  console.log('🚦 CARD: StatusCard rendering with:', { 
    title: card.title, 
    status: card.status, 
    message: card.message,
    hasTitle: !!card.title,
    hasStatus: !!card.status,
    hasMessage: !!card.message,
    fullCard: card
  });

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'online':
      case 'active':
      case 'success':
        return '#4caf50';
      case 'warning':
      case 'pending':
        return '#ff9800';
      case 'error':
      case 'offline':
      case 'failed':
        return '#f44336';
      default:
        return '#9e9e9e';
    }
  };

  const statusColor = getStatusColor(card.status);
  console.log('🚦 CARD: StatusCard color determined:', statusColor, 'for status:', card.status);

  const element = (
    <div className="card" style={{ borderLeftColor: statusColor }}>
      <div className="card-title">{card.title || 'Status Card'}</div>
      <div className="card-content">
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px',
          marginBottom: '8px'
        }}>
          <div 
            style={{
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              backgroundColor: statusColor
            }}
          />
          <span style={{ fontWeight: '500', textTransform: 'capitalize' }}>
            {card.status || 'Unknown'}
          </span>
        </div>
        {card.message && <div>{card.message}</div>}
      </div>
    </div>
  );
  
  console.log('🚦 CARD: StatusCard element created:', element);
  console.log('🚦 CARD: ========== StatusCard END ==========');
  
  return element;
};

const InfoCard = ({ card }) => {
  console.log('ℹ️ CARD: Rendering InfoCard with:', { 
    title: card.title, 
    hasItems: !!card.items,
    itemsLength: card.items?.length,
    content: card.content 
  });

  return (
    <div className="card" style={{ borderLeftColor: '#17a2b8' }}>
      <div className="card-title">{card.title || 'Info Card'}</div>
      <div className="card-content">
        {card.items && Array.isArray(card.items) ? (
          <ul style={{ paddingLeft: '16px', margin: 0 }}>
            {card.items.map((item, index) => (
              <li key={index} style={{ marginBottom: '4px' }}>
                {item}
              </li>
            ))}
          </ul>
        ) : (
          <div>{card.content || 'No information available'}</div>
        )}
      </div>
    </div>
  );
};

const ChartCard = ({ card }) => {
  console.log('📊 CARD: Rendering ChartCard with:', { 
    title: card.title,
    hasData: !!card.data,
    dataLength: card.data?.length,
    chartType: card.chartType 
  });

  const data = Array.isArray(card.data) ? card.data : [];
  const maxValue = data.length > 0 ? Math.max(...data) : 1;
  
  return (
    <div className="card" style={{ borderLeftColor: '#28a745' }}>
      <div className="card-title">{card.title || 'Chart Card'}</div>
      <div className="card-content">
        {data.length > 0 ? (
          <>
            <div style={{ 
              display: 'flex', 
              alignItems: 'end', 
              gap: '2px', 
              height: '60px',
              marginTop: '12px'
            }}>
              {data.map((value, index) => (
                <div
                  key={index}
                  style={{
                    backgroundColor: '#007bff',
                    width: `${100 / data.length}%`,
                    height: `${(value / maxValue) * 100}%`,
                    minHeight: '2px',
                    borderRadius: '2px'
                  }}
                />
              ))}
            </div>
            <div style={{ 
              fontSize: '12px', 
              color: '#666', 
              marginTop: '8px' 
            }}>
              Chart Type: {card.chartType || 'bar'} | Data Points: {data.length}
            </div>
          </>
        ) : (
          <div style={{ 
            color: '#666',
            fontStyle: 'italic',
            textAlign: 'center',
            padding: '20px'
          }}>
            No chart data available
          </div>
        )}
      </div>
    </div>
  );
};

const MetricCard = ({ card }) => {
  console.log('📈 CARD: Rendering MetricCard with:', { 
    title: card.title,
    value: card.value,
    unit: card.unit,
    description: card.description 
  });

  return (
    <div className="card" style={{ borderLeftColor: '#6f42c1' }}>
      <div className="card-title">{card.title || 'Metric Card'}</div>
      <div className="card-content">
        <div style={{ 
          fontSize: '28px', 
          fontWeight: 'bold', 
          color: '#6f42c1',
          marginBottom: '4px',
          lineHeight: '1.2'
        }}>
          {card.value !== undefined ? card.value : 'N/A'}
          {card.unit && (
            <span style={{ fontSize: '16px', fontWeight: 'normal', marginLeft: '4px' }}>
              {card.unit}
            </span>
          )}
        </div>
        {card.description && (
          <div style={{ marginTop: '8px', fontSize: '14px', color: '#555' }}>
            {card.description}
          </div>
        )}
      </div>
    </div>
  );
};

const ImageCard = ({ card }) => {
  console.log('🖼️ CARD: Rendering ImageCard with:', { 
    title: card.title,
    imageUrl: card.imageUrl,
    description: card.description 
  });

  return (
    <div className="card" style={{ borderLeftColor: '#fd7e14' }}>
      <div className="card-title">{card.title || 'Image Card'}</div>
      <div className="card-content">
        {card.imageUrl ? (
          <>
            <img 
              src={card.imageUrl} 
              alt={card.alt || card.title}
              style={{ 
                maxWidth: '100%', 
                height: 'auto',
                borderRadius: '4px'
              }}
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'block';
              }}
            />
            <div style={{ display: 'none', color: '#666', fontStyle: 'italic' }}>
              Image failed to load
            </div>
          </>
        ) : (
          <div style={{ 
            color: '#666',
            fontStyle: 'italic',
            textAlign: 'center',
            padding: '20px'
          }}>
            No image URL provided
          </div>
        )}
        {card.description && (
          <div style={{ marginTop: '8px' }}>
            {card.description}
          </div>
        )}
      </div>
    </div>
  );
};

const UnknownCard = ({ card }) => {
  console.log('⚠️ CARD: Rendering UnknownCard with data:', card);
  
  const renderCardContent = () => {
    if (!card || Object.keys(card).length === 0) {
      return <div style={{ color: '#666', fontStyle: 'italic' }}>No card data available</div>;
    }

    // Try to render some useful content from the card data
    const content = [];
    
    if (card.title) {
      content.push(
        <div key="title" style={{ fontWeight: 'bold', marginBottom: '8px' }}>
          {card.title}
        </div>
      );
    }
    
    if (card.content) {
      content.push(
        <div key="content" style={{ marginBottom: '8px' }}>
          {card.content}
        </div>
      );
    }
    
    if (card.value !== undefined) {
      content.push(
        <div key="value" style={{ fontSize: '18px', fontWeight: 'bold', color: '#007bff', marginBottom: '4px' }}>
          {card.value} {card.unit || ''}
        </div>
      );
    }
    
    if (card.items && Array.isArray(card.items)) {
      content.push(
        <ul key="items" style={{ paddingLeft: '16px', margin: '8px 0' }}>
          {card.items.slice(0, 3).map((item, index) => (
            <li key={index} style={{ marginBottom: '4px' }}>
              {item}
            </li>
          ))}
          {card.items.length > 3 && (
            <li style={{ color: '#666', fontStyle: 'italic' }}>
              ...and {card.items.length - 3} more
            </li>
          )}
        </ul>
      );
    }
    
    if (card.data && Array.isArray(card.data)) {
      content.push(
        <div key="data" style={{ marginTop: '8px' }}>
          <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>
            Data: {card.data.slice(0, 5).join(', ')}
            {card.data.length > 5 && '...'}
          </div>
        </div>
      );
    }
    
    if (card.status) {
      content.push(
        <div key="status" style={{ 
          padding: '4px 8px', 
          backgroundColor: '#f0f0f0', 
          borderRadius: '4px',
          display: 'inline-block',
          marginBottom: '8px'
        }}>
          Status: {card.status}
        </div>
      );
    }

    return content.length > 0 ? content : (
      <div style={{ color: '#666', fontStyle: 'italic' }}>
        Unable to display card content
      </div>
    );
  };

  return (
    <div className="card" style={{ 
      borderColor: '#ff9800',
      backgroundColor: '#fff8e1'
    }}>
      <div className="card-title" style={{ color: '#ff9800' }}>
        {card?.type ? `Unknown Card Type: ${card.type}` : 'Invalid Card'}
      </div>
      <div className="card-content">
        <div style={{ marginBottom: '12px' }}>
          {renderCardContent()}
        </div>
        
        {process.env.NODE_ENV === 'development' && (
          <details style={{ 
            marginTop: '12px',
            padding: '8px',
            backgroundColor: '#f5f5f5',
            borderRadius: '4px',
            fontSize: '12px'
          }}>
            <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>
              Debug Info
            </summary>
            <div style={{ marginTop: '8px' }}>
              <div><strong>Card ID:</strong> {card?.id || 'No ID'}</div>
              <div><strong>Type:</strong> {card?.type || 'No type'}</div>
              <div><strong>Available Keys:</strong> {card ? Object.keys(card).join(', ') : 'None'}</div>
              <pre style={{ 
                marginTop: '8px',
                padding: '8px',
                backgroundColor: 'white',
                borderRadius: '2px',
                overflow: 'auto',
                maxHeight: '150px'
              }}>
                {JSON.stringify(card, null, 2)}
              </pre>
            </div>
          </details>
        )}
      </div>
    </div>
  );
};

const CardRenderer = ({ card }) => {
  console.log('🃏 CARD: ========== CARDRENDERER START ==========');
  console.log('🃏 CARD: CardRenderer function called with card:', card);
  console.log('🃏 CARD: Call stack:', new Error().stack);
  
  // Log complete props flow
  logPropsFlow('CardRenderer', { card }, {
    timestamp: new Date().toISOString(),
    renderingPhase: 'cardRenderer_entry'
  });
  
  console.log('🃏 CARD: Received props:', arguments);
  console.log('🃏 CARD: Received card prop:', card);
  
  // Comprehensive validation
  const validation = validateCard(card);
  console.log('🔍 CARD: CardRenderer validation result:', validation);
  
  if (!validation.isValid) {
    console.error('❌ CARD: CardRenderer validation failed:', validation.errors);
  }
  
  // Deep analysis of the card object
  console.log('🃏 CARD: Card deep analysis:', {
    cardExists: !!card,
    cardType: typeof card,
    cardConstructor: card?.constructor?.name,
    isArray: Array.isArray(card),
    isObject: card && typeof card === 'object' && !Array.isArray(card),
    cardString: JSON.stringify(card),
    cardKeys: card ? Object.keys(card) : null,
    cardValues: card ? Object.values(card) : null
  });

  console.log('🃏 CARD: Card validation details:', {
    hasCard: !!card,
    hasType: !!(card?.type),
    type: card?.type,
    typeOfType: typeof card?.type,
    typeValue: card?.type,
    hasId: !!(card?.id),
    id: card?.id,
    hasTitle: !!(card?.title),
    title: card?.title,
    allKeys: card ? Object.keys(card) : null
  });

  // Check for common issues
  if (card === null) {
    console.error('❌ CARD: Card is explicitly null');
    return <UnknownCard card={{}} />;
  }

  if (card === undefined) {
    console.error('❌ CARD: Card is undefined');
    return <UnknownCard card={{}} />;
  }

  if (typeof card !== 'object') {
    console.error('❌ CARD: Card is not an object, got:', typeof card, card);
    return <UnknownCard card={{ error: `Invalid card type: ${typeof card}`, value: card }} />;
  }

  if (Array.isArray(card)) {
    console.error('❌ CARD: Card is an array instead of object:', card);
    return <UnknownCard card={{ error: 'Card is an array', value: card }} />;
  }

  // Type field analysis
  if (!card.hasOwnProperty('type')) {
    console.error('❌ CARD: Card object does not have "type" property');
    console.error('❌ CARD: Available properties:', Object.keys(card));
    return <UnknownCard card={card} />;
  }

  if (card.type === null) {
    console.error('❌ CARD: Card type is null');
    return <UnknownCard card={card} />;
  }

  if (card.type === undefined) {
    console.error('❌ CARD: Card type is undefined');
    return <UnknownCard card={card} />;
  }

  if (typeof card.type !== 'string') {
    console.error('❌ CARD: Card type is not a string, got:', typeof card.type, card.type);
    return <UnknownCard card={card} />;
  }

  if (card.type.trim() === '') {
    console.error('❌ CARD: Card type is empty string');
    return <UnknownCard card={card} />;
  }

  const cardType = card.type.toLowerCase();
  console.log('🃏 CARD: Processing card type:', `"${cardType}"`);
  console.log('🃏 CARD: Original type value:', `"${card.type}"`);
  console.log('🃏 CARD: Type conversion successful');

  // Advanced string debugging
  console.log('🔬 CARD: Advanced type analysis:', {
    originalType: card.type,
    originalLength: card.type.length,
    originalCharCodes: [...card.type].map(char => char.charCodeAt(0)),
    trimmed: card.type.trim(),
    trimmedLength: card.type.trim().length,
    processedType: cardType,
    processedLength: cardType.length,
    processedCharCodes: [...cardType].map(char => char.charCodeAt(0)),
    hasWhitespace: /\s/.test(card.type),
    hasSpecialChars: /[^\w]/.test(card.type.replace(/\s/g, '')),
    startsWithLetter: /^[a-zA-Z]/.test(card.type),
    exactMatch_text: cardType === 'text',
    exactMatch_status: cardType === 'status',
    exactMatch_info: cardType === 'info',
    exactMatch_chart: cardType === 'chart',
    exactMatch_metric: cardType === 'metric',
    exactMatch_image: cardType === 'image'
  });

  // Log before entering switch
  console.log('🃏 CARD: About to enter switch statement with type:', cardType);
  console.log('🃏 CARD: Switch statement input verification:', {
    typeValue: cardType,
    typeString: String(cardType),
    typeToString: cardType.toString(),
    typeValueOf: cardType.valueOf()
  });

  switch (cardType) {
    case 'text':
      console.log('✅ CARD: Matched TEXT type, rendering TextCard');
      console.log('🃏 CARD: Calling TextCard with props:', card);
      try {
        const textCardElement = <TextCard card={card} />;
        console.log('🏁 CARD: TextCard element created successfully:', textCardElement);
        console.log('🏁 CARD: TextCard element type:', textCardElement?.type);
        console.log('🏁 CARD: TextCard element props:', textCardElement?.props);
        return textCardElement;
      } catch (error) {
        console.error('💥 CARD: Error creating TextCard:', error);
        throw error;
      }
    case 'status':
      console.log('✅ CARD: Matched STATUS type, rendering StatusCard');
      console.log('🃏 CARD: Calling StatusCard with props:', card);
      try {
        const statusCardElement = <StatusCard card={card} />;
        console.log('🏁 CARD: StatusCard element created successfully:', statusCardElement);
        return statusCardElement;
      } catch (error) {
        console.error('💥 CARD: Error creating StatusCard:', error);
        throw error;
      }
    case 'info':
      console.log('✅ CARD: Matched INFO type, rendering InfoCard');
      console.log('🃏 CARD: Calling InfoCard with props:', card);
      try {
        const infoCardElement = <InfoCard card={card} />;
        console.log('🏁 CARD: InfoCard element created successfully:', infoCardElement);
        return infoCardElement;
      } catch (error) {
        console.error('💥 CARD: Error creating InfoCard:', error);
        throw error;
      }
    case 'chart':
      console.log('✅ CARD: Matched CHART type, rendering ChartCard');
      console.log('🃏 CARD: Calling ChartCard with props:', card);
      try {
        const chartCardElement = <ChartCard card={card} />;
        console.log('🏁 CARD: ChartCard element created successfully:', chartCardElement);
        return chartCardElement;
      } catch (error) {
        console.error('💥 CARD: Error creating ChartCard:', error);
        throw error;
      }
    case 'metric':
      console.log('✅ CARD: Matched METRIC type, rendering MetricCard');
      console.log('🃏 CARD: Calling MetricCard with props:', card);
      try {
        const metricCardElement = <MetricCard card={card} />;
        console.log('🏁 CARD: MetricCard element created successfully:', metricCardElement);
        return metricCardElement;
      } catch (error) {
        console.error('💥 CARD: Error creating MetricCard:', error);
        throw error;
      }
    case 'image':
      console.log('✅ CARD: Matched IMAGE type, rendering ImageCard');
      console.log('🃏 CARD: Calling ImageCard with props:', card);
      try {
        const imageCardElement = <ImageCard card={card} />;
        console.log('🏁 CARD: ImageCard element created successfully:', imageCardElement);
        return imageCardElement;
      } catch (error) {
        console.error('💥 CARD: Error creating ImageCard:', error);
        throw error;
      }
    default:
      console.warn(`⚠️ CARD: ENTERING DEFAULT CASE - No match found for card type "${cardType}"`);
      console.warn(`⚠️ CARD: Available types: text, status, info, chart, metric, image`);
      console.warn(`⚠️ CARD: Type comparison results:`, {
        text: cardType === 'text',
        status: cardType === 'status',
        info: cardType === 'info',
        chart: cardType === 'chart',
        metric: cardType === 'metric',
        image: cardType === 'image'
      });
      console.warn(`⚠️ CARD: Type analysis for debugging:`, {
        cardTypeValue: cardType,
        cardTypeLength: cardType.length,
        isString: typeof cardType === 'string',
        trimmedType: cardType.trim(),
        firstChar: cardType[0],
        lastChar: cardType[cardType.length - 1],
        allCharacters: [...cardType],
        isExactlyText: cardType === 'text',
        includesText: cardType.includes('text'),
        indexOfText: cardType.indexOf('text')
      });
      console.warn(`⚠️ CARD: Using UnknownCard fallback`);
      const unknownCardElement = <UnknownCard card={card} />;
      console.log('🏁 CARD: UnknownCard element created:', unknownCardElement);
      return unknownCardElement;
  }
};

export default CardRenderer;