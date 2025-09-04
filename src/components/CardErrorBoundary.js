import React from 'react';

class CardErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
      cardData: null
    };
  }

  static getDerivedStateFromError(error) {
    console.error('🛡️ CARD_ERROR_BOUNDARY: Error caught by CardErrorBoundary:', error);
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('🛡️ CARD_ERROR_BOUNDARY: ========== CARD ERROR BOUNDARY TRIGGERED ==========');
    console.error('🛡️ CARD_ERROR_BOUNDARY: Error details:', error);
    console.error('🛡️ CARD_ERROR_BOUNDARY: Error message:', error.message);
    console.error('🛡️ CARD_ERROR_BOUNDARY: Error stack:', error.stack);
    console.error('🛡️ CARD_ERROR_BOUNDARY: Component stack:', errorInfo.componentStack);
    console.error('🛡️ CARD_ERROR_BOUNDARY: Card data that caused error:', this.props.cardData);
    console.error('🛡️ CARD_ERROR_BOUNDARY: All props:', this.props);
    
    this.setState({
      error: error,
      errorInfo: errorInfo,
      cardData: this.props.cardData
    });
    
    if (this.props.onError) {
      this.props.onError(error, errorInfo, this.props.cardData);
    }
  }

  handleRetry = () => {
    console.log('🛡️ CARD_ERROR_BOUNDARY: Retrying card render');
    this.setState({ 
      hasError: false, 
      error: null, 
      errorInfo: null,
      cardData: null
    });
    
    if (this.props.onRetry) {
      this.props.onRetry();
    }
  };

  render() {
    if (this.state.hasError) {
      console.log('🛡️ CARD_ERROR_BOUNDARY: Rendering error fallback UI');
      
      return (
        <div style={{
          border: '3px solid #f44336',
          borderRadius: '8px',
          padding: '16px',
          margin: '8px 0',
          backgroundColor: '#ffebee'
        }}>
          <div style={{ color: '#f44336', fontWeight: 'bold', marginBottom: '8px' }}>
            ⚠️ Card Rendering Error
          </div>
          <div style={{ color: '#666', fontSize: '14px', marginBottom: '12px' }}>
            A React error occurred while rendering this card.
          </div>
          
          {this.state.error && (
            <div style={{ marginBottom: '12px' }}>
              <div style={{ fontWeight: '600', marginBottom: '4px' }}>Error:</div>
              <div style={{ 
                backgroundColor: '#fff', 
                padding: '8px', 
                borderRadius: '4px',
                fontSize: '13px',
                fontFamily: 'monospace',
                color: '#d32f2f'
              }}>
                {this.state.error.message}
              </div>
            </div>
          )}
          
          <button 
            onClick={this.handleRetry}
            style={{
              padding: '8px 16px',
              backgroundColor: '#f44336',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
              marginRight: '8px'
            }}
          >
            Retry Rendering
          </button>
          
          {process.env.NODE_ENV === 'development' && (
            <details style={{ marginTop: '12px' }}>
              <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>
                Debug Information
              </summary>
              <div style={{ marginTop: '8px', fontSize: '12px' }}>
                <div><strong>Error Message:</strong> {this.state.error?.message}</div>
                <div style={{ marginTop: '8px' }}>
                  <strong>Card Data:</strong>
                  <pre style={{ 
                    marginTop: '4px',
                    padding: '8px',
                    backgroundColor: '#f5f5f5',
                    borderRadius: '4px',
                    overflow: 'auto',
                    maxHeight: '150px'
                  }}>
                    {JSON.stringify(this.state.cardData || this.props.cardData, null, 2)}
                  </pre>
                </div>
                <div style={{ marginTop: '8px' }}>
                  <strong>Component Stack:</strong>
                  <pre style={{ 
                    marginTop: '4px',
                    padding: '8px',
                    backgroundColor: '#f5f5f5',
                    borderRadius: '4px',
                    overflow: 'auto',
                    maxHeight: '100px',
                    fontSize: '11px'
                  }}>
                    {this.state.errorInfo?.componentStack}
                  </pre>
                </div>
                <div style={{ marginTop: '8px' }}>
                  <strong>Error Stack:</strong>
                  <pre style={{ 
                    marginTop: '4px',
                    padding: '8px',
                    backgroundColor: '#f5f5f5',
                    borderRadius: '4px',
                    overflow: 'auto',
                    maxHeight: '100px',
                    fontSize: '11px'
                  }}>
                    {this.state.error?.stack}
                  </pre>
                </div>
              </div>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default CardErrorBoundary;