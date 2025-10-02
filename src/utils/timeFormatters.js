export const formatTime = (date) => {
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return { hours, minutes };
};

export const formatDate = (date) => {
  const weekday = date.toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase();
  const month = date.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
  const day = date.getDate();
  return { weekday, month, day };
};

export const getTimeOfDayGradient = (hour) => {
  if (hour >= 5 && hour < 8) {
    return 'from-amber-600/30 via-rose-600/30 to-violet-900/40';
  } else if (hour >= 8 && hour < 17) {
    return 'from-cyan-600/25 via-blue-600/25 to-indigo-900/40';
  } else if (hour >= 17 && hour < 20) {
    return 'from-orange-600/30 via-red-700/30 to-purple-900/40';
  } else {
    return 'from-indigo-950/50 via-purple-950/50 to-slate-950/50';
  }
};

export const getAlertOverlay = (alertState) => {
  if (alertState === 'urgent') return 'rgba(239, 68, 68, 0.2)';
  if (alertState === 'attention') return 'rgba(249, 115, 22, 0.1)';
  return 'transparent';
};