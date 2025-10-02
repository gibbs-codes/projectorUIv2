import { useState, useEffect } from 'react';
import useDashboardApi from './useDashboardApi';

const MOCK_DATA = {
  mode: 'personal',
  alertState: null,
  weather: {
    temp: 72,
    condition: 'Partly Cloudy',
    icon: '02d',
    feelsLike: 70,
    humidity: 55,
    windSpeed: 8,
    high: 78,
    low: 65
  },
  nextEvent: {
    title: 'Team Meeting',
    time: '2:00 PM',
    minutesUntil: 45,
    location: 'Office',
    commuteTime: 13,
    startTime: '2025-10-02T14:00:00.000Z'
  },
  agenda: [
    { time: '2:00 PM', title: 'Team Meeting', done: false, location: 'Office', isAllDay: false },
    { time: '4:30 PM', title: 'Client Check-in', done: false, location: 'Zoom', isAllDay: false },
    { time: '6:00 PM', title: 'Dinner with Alex', done: false, location: 'Restaurant', isAllDay: false }
  ],
  todos: [
    {
      text: 'Review PRs',
      urgent: true,
      done: false,
      id: '123456',
      dueDate: '2025-10-02T16:00:00.000Z',
      priority: 4,
      labels: ['work']
    },
    {
      text: 'Buy groceries',
      urgent: true,
      done: false,
      id: '123457',
      dueDate: '2025-10-02T18:00:00.000Z',
      priority: 3,
      labels: ['personal']
    },
    {
      text: 'Call dentist',
      urgent: false,
      done: false,
      id: '123458',
      priority: 2,
      labels: ['health']
    },
    {
      text: 'Book flight to NYC',
      urgent: false,
      done: false,
      id: '123459',
      priority: 1,
      labels: ['travel']
    }
  ],
  localEvents: [
    { title: 'Jazz at Green Mill', type: 'music', time: 'Tonight 8PM' },
    { title: 'New Ethiopian spot', type: 'food', time: 'Lincoln Park' }
  ],
  llmMessage: {
    active: true,
    message: 'Traffic building on I-90. Consider leaving 10 minutes early for your 3PM meeting.',
    urgency: 'attention'
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
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
  const useMockData = import.meta.env.VITE_ENABLE_MOCK_DATA === 'true';
  const pollInterval = 30000; // 30 seconds

  const { data: apiData, loading, error, lastFetch, refreshData, changeMode } = useDashboardApi(
    useMockData ? null : apiBaseUrl,
    pollInterval
  );
  const [dashboardData, setDashboardData] = useState(MOCK_DATA);

  useEffect(() => {
    if (useMockData) {
      console.log('📊 Using mock data for dashboard');
      setDashboardData(MOCK_DATA);
    } else if (apiData) {
      console.log('📊 Using live API data for dashboard');
      setDashboardData(apiData);
    }
  }, [useMockData, apiData]);

  return {
    data: dashboardData,
    loading: useMockData ? false : loading,
    error: useMockData ? null : error,
    lastFetch,
    isMockData: useMockData,
    refreshData: useMockData ? () => {} : refreshData,
    changeMode: useMockData ? () => {} : changeMode
  };
};

export default useDashboardData;