import React from 'react';

const TextCard = ({ card }) => {
  console.log('📝 CARD: Rendering TextCard with:', { title: card.title, content: card.content });
  
  return (
    <div className="card" style={{ borderLeftColor: '#007bff' }}>
      <div className="card-title">{card.title || 'Text Card'}</div>
      <div className="card-content">
        {card.content || 'No content available'}
      </div>
    </div>
  );
};

const StatusCard = ({ card }) => {
  console.log('🚦 CARD: Rendering StatusCard with:', { 
    title: card.title, 
    status: card.status, 
    message: card.message 
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

  return (
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
  console.log('🃏 CARD: Rendering card:', card);
  console.log('🃏 CARD: Card validation:', {
    hasCard: !!card,
    hasType: !!(card?.type),
    type: card?.type,
    typeOfType: typeof card?.type,
    cardKeys: card ? Object.keys(card) : null,
    cardId: card?.id,
    cardTitle: card?.title
  });

  if (!card) {
    console.error('❌ CARD: Card is null/undefined');
    return <UnknownCard card={{}} />;
  }

  if (!card.type) {
    console.error('❌ CARD: Card missing type field:', card);
    return <UnknownCard card={card} />;
  }

  const cardType = card.type.toLowerCase();
  console.log('🃏 CARD: Processing card type:', cardType);

  switch (cardType) {
    case 'text':
      console.log('🃏 CARD: Rendering TextCard');
      return <TextCard card={card} />;
    case 'status':
      console.log('🃏 CARD: Rendering StatusCard');
      return <StatusCard card={card} />;
    case 'info':
      console.log('🃏 CARD: Rendering InfoCard');
      return <InfoCard card={card} />;
    case 'chart':
      console.log('🃏 CARD: Rendering ChartCard');
      return <ChartCard card={card} />;
    case 'metric':
      console.log('🃏 CARD: Rendering MetricCard');
      return <MetricCard card={card} />;
    case 'image':
      console.log('🃏 CARD: Rendering ImageCard');
      return <ImageCard card={card} />;
    default:
      console.warn(`⚠️ CARD: Unknown card type "${cardType}", using fallback`);
      return <UnknownCard card={card} />;
  }
};

export default CardRenderer;