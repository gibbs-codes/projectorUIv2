# Projector UI v2

A React-based dynamic layout engine that renders zones and cards based on API configuration.

## Features

- **Modern React 18** with hooks and functional components
- **CSS Grid-based layout** system with percentage-based sizing
- **Dynamic card rendering** supporting multiple card types
- **API polling** every 10 seconds for real-time updates
- **Offline fallback** with cached data using localStorage
- **Error boundaries** and comprehensive error handling
- **Loading states** and graceful failure handling
- **Responsive design** with mobile support

## Architecture

### Components

- **App.js** - Main component that handles API polling and global state
- **LayoutEngine.js** - Renders CSS Grid zones from profile configuration
- **Zone.js** - Individual zone container that renders assigned cards
- **CardRenderer.js** - Dynamically renders cards based on type
- **LoadingState.js** - Loading, error, and offline UI states
- **ErrorBoundary.js** - Catches and handles React errors

### Services

- **api.js** - API service with caching and offline support

## Card Types Supported

- **Text Card** - Simple text content with title
- **Status Card** - Status indicator with colored dot and message
- **Info Card** - Information display with bullet points
- **Chart Card** - Simple bar chart visualization
- **Metric Card** - Numerical metrics with units
- **Image Card** - Image display with fallback handling

## Profile Configuration

The application expects a profile JSON structure:

```json
{
  "id": "profile-id",
  "name": "Profile Name",
  "gridConfig": {
    "columns": "1fr 1fr",
    "rows": "1fr 1fr",
    "areas": [
      ["header", "sidebar"],
      ["main", "sidebar"]
    ]
  },
  "zones": [
    {
      "id": "header",
      "name": "Header Zone",
      "gridArea": "header",
      "cards": [...]
    }
  ]
}
```

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm start
   ```

3. Open http://localhost:3000 in your browser

## API Configuration

Set the API endpoint using the environment variable:
```
REACT_APP_API_URL=http://your-api-server:3001
```

The app expects a GET endpoint at `/api/profile/active` that returns a profile configuration.

## Development Features

- Mock data fallback when API is unavailable
- Development timestamp indicator
- Detailed error information in development mode
- Component stack traces for debugging

## Browser Support

- Modern browsers with CSS Grid support
- Mobile responsive design
- Offline functionality with service worker capabilities