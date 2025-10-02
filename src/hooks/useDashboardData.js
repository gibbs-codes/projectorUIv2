import { useState, useEffect } from 'react';
import useWebSocket from './useWebSocket';

const MOCK_DATA = {
  mode: 'personal',
  alertState: null,
  weather: {
    temp: 72,
    condition: 'Partly Cloudy',
    forecast: 'Rain after 3PM',
    high: 75,
    low: 68
  },
  nextEvent: {
    title: 'Team Standup',
    time: '3:00 PM',
    minutesUntil: 28,
    location: 'Conference Room B',
    commuteTime: 13,
    type: 'in-person'
  },
  agenda: [
    { time: '9:00 AM', title: 'Morning Standup', done: true },
    { time: '2:30 PM', title: 'Client Presentation', done: false },
    { time: '6:00 PM', title: 'Dinner with Alex', done: false }
  ],
  todos: [
    { text: 'Review Q4 proposals', urgent: true, done: false },
    { text: 'Buy groceries', urgent: true, done: false },
    { text: 'Call dentist', urgent: false, done: false },
    { text: 'Book flight to NYC', urgent: false, done: false }
  ],
  localEvents: [
    { title: 'Jazz at Green Mill', type: 'music', time: 'Tonight 8PM' },
    { title: 'New Ethiopian spot', type: 'food', time: 'Lincoln Park' }
  ],
  llmMessage: {
    active: true,
    message: 'Traffic building on I-90. Consider leaving 10 minutes early for your 3PM meeting.',
    urgency: 'attention',
    icon: 'brain'
  },
  briefing: {
    greeting: 'Good morning',
    summary: 'Light day ahead. 3 meetings, all virtual. Weather perfect for a walk after work.',
    stats: {
      events: 3,
      tasks: 4,
      urgent: 2,
      leaveBy: '8:15 AM'
    }
  }
};

const useDashboardData = () => {
  const wsUrl = import.meta.env.VITE_WS_URL;
  const useMockData = import.meta.env.VITE_ENABLE_MOCK_DATA === 'true';

  const { data: wsData, isConnected, error } = useWebSocket(wsUrl);
  const [dashboardData, setDashboardData] = useState(MOCK_DATA);

  useEffect(() => {
    if (useMockData) {
      setDashboardData(MOCK_DATA);
    } else if (wsData) {
      setDashboardData(wsData);
    }
  }, [useMockData, wsData]);

  return {
    data: dashboardData,
    isConnected,
    error,
    isMockData: useMockData
  };
};

export default useDashboardData;