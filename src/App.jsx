import { useState, useEffect } from 'react';
import useDashboardData from './hooks/useDashboardData';
import { formatTime, formatDate, getTimeOfDayGradient, getAlertOverlay } from './utils/timeFormatters';

// Layout components
import PersonalLayout from './components/layouts/PersonalLayout';
import GuestLayout from './components/layouts/GuestLayout';
import BriefingLayout from './components/layouts/BriefingLayout';

// Shared components
import TimeDisplay from './components/shared/TimeDisplay';
import DateDisplay from './components/shared/DateDisplay';
import WeatherDisplay from './components/shared/WeatherDisplay';

const App = () => {
  const [time, setTime] = useState(new Date());
  const [localMode, setLocalMode] = useState('personal');

  const { data: dashboardData, isConnected, error, isMockData } = useDashboardData();

  const mode = dashboardData?.mode || localMode;

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const hour = time.getHours();
  const timeObj = formatTime(time);
  const dateObj = formatDate(time);

  // Loading state
  if (!dashboardData) {
    return (
      <div className="w-full h-screen bg-black flex items-center justify-center">
        <div className="text-white text-2xl">Loading dashboard...</div>
      </div>
    );
  }

  const renderContent = () => {
    switch (mode) {
      case 'personal':
        return <PersonalLayout data={dashboardData} />;
      case 'guest':
        return <GuestLayout data={dashboardData} />;
      case 'briefing':
        return <BriefingLayout data={dashboardData} />;
      default:
        return <PersonalLayout data={dashboardData} />;
    }
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black">
      {/* Gradient background */}
      <div className={`absolute inset-0 bg-gradient-to-br ${getTimeOfDayGradient(hour)}`} />

      {/* Alert overlay */}
      <div
        className="absolute inset-0 transition-all duration-500"
        style={{ backgroundColor: getAlertOverlay(dashboardData.alertState) }}
      />

      {/* Noise texture */}
      <div className="absolute inset-0 opacity-20"
           style={{
             backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
             backgroundSize: '200px'
           }} />

      {/* Main content */}
      <div className="relative z-10 h-full p-12 flex flex-col">

        {/* Top bar - Date and Weather */}
        <div className="flex justify-between items-start mb-12">
          <DateDisplay dateObj={dateObj} />
          <WeatherDisplay weather={dashboardData.weather} />
        </div>

        {/* Center Time */}
        <div className="flex items-center justify-center mb-12">
          <TimeDisplay timeObj={timeObj} />
        </div>

        {/* Dynamic content based on mode */}
        <div className="flex-1">
          {renderContent()}
        </div>

        {/* Bottom status bar */}
        <div className="flex justify-between items-center mt-8">
          <div className="flex gap-8">
            <button
              onClick={() => setLocalMode('personal')}
              className={`text-lg tracking-wider uppercase font-light ${mode === 'personal' ? 'text-white' : 'text-white/40'}`}
            >
              Personal
            </button>
            <button
              onClick={() => setLocalMode('guest')}
              className={`text-lg tracking-wider uppercase font-light ${mode === 'guest' ? 'text-white' : 'text-white/40'}`}
            >
              Guest
            </button>
            <button
              onClick={() => setLocalMode('briefing')}
              className={`text-lg tracking-wider uppercase font-light ${mode === 'briefing' ? 'text-white' : 'text-white/40'}`}
            >
              Briefing
            </button>
          </div>

          <div className="flex gap-6 items-center">
            {/* Connection status */}
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`} />
              <span className="text-white/50 text-sm">
                {isConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>

            {/* Mock data badge */}
            {isMockData && (
              <div className="text-white/40 text-sm tracking-wider uppercase font-light">
                Mock Data
              </div>
            )}

            {/* Error indicator */}
            {error && (
              <div className="text-red-400 text-sm">
                Error: {error}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;