import React from 'react';

const TextCard = ({ card }) => (
  <div className="card">
    <div className="card-title">{card.title}</div>
    <div className="card-content">{card.content}</div>
  </div>
);

const StatusCard = ({ card }) => {
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

  return (
    <div className="card">
      <div className="card-title">{card.title}</div>
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
              backgroundColor: getStatusColor(card.status)
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

const InfoCard = ({ card }) => (
  <div className="card">
    <div className="card-title">{card.title}</div>
    <div className="card-content">
      {card.items ? (
        <ul style={{ paddingLeft: '16px', margin: 0 }}>
          {card.items.map((item, index) => (
            <li key={index} style={{ marginBottom: '4px' }}>
              {item}
            </li>
          ))}
        </ul>
      ) : (
        <div>{card.content}</div>
      )}
    </div>
  </div>
);

const ChartCard = ({ card }) => {
  const data = card.data || [];
  const maxValue = Math.max(...data, 1);
  
  return (
    <div className="card">
      <div className="card-title">{card.title}</div>
      <div className="card-content">
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
          Chart Type: {card.chartType || 'bar'}
        </div>
      </div>
    </div>
  );
};

const MetricCard = ({ card }) => (
  <div className="card">
    <div className="card-title">{card.title}</div>
    <div className="card-content">
      <div style={{ 
        fontSize: '24px', 
        fontWeight: 'bold', 
        color: '#007bff',
        marginBottom: '4px'
      }}>
        {card.value || '0'}
      </div>
      {card.unit && (
        <div style={{ fontSize: '12px', color: '#666' }}>
          {card.unit}
        </div>
      )}
      {card.description && (
        <div style={{ marginTop: '8px', fontSize: '14px' }}>
          {card.description}
        </div>
      )}
    </div>
  </div>
);

const ImageCard = ({ card }) => (
  <div className="card">
    <div className="card-title">{card.title}</div>
    <div className="card-content">
      {card.imageUrl ? (
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
      ) : null}
      <div style={{ display: 'none', color: '#666', fontStyle: 'italic' }}>
        Image failed to load
      </div>
      {card.description && (
        <div style={{ marginTop: '8px' }}>
          {card.description}
        </div>
      )}
    </div>
  </div>
);

const UnknownCard = ({ card }) => (
  <div className="card" style={{ borderColor: '#ff9800' }}>
    <div className="card-title">Unknown Card Type</div>
    <div className="card-content">
      <div style={{ color: '#ff9800', marginBottom: '8px' }}>
        Type: {card.type}
      </div>
      <div style={{ fontSize: '12px', color: '#666' }}>
        Card ID: {card.id}
      </div>
      {card.title && (
        <div style={{ marginTop: '8px' }}>
          Original Title: {card.title}
        </div>
      )}
    </div>
  </div>
);

const CardRenderer = ({ card }) => {
  if (!card || !card.type) {
    return <UnknownCard card={card || {}} />;
  }

  switch (card.type.toLowerCase()) {
    case 'text':
      return <TextCard card={card} />;
    case 'status':
      return <StatusCard card={card} />;
    case 'info':
      return <InfoCard card={card} />;
    case 'chart':
      return <ChartCard card={card} />;
    case 'metric':
      return <MetricCard card={card} />;
    case 'image':
      return <ImageCard card={card} />;
    default:
      return <UnknownCard card={card} />;
  }
};

export default CardRenderer;