const TimeDisplay = ({ timeObj }) => {
  return (
    <div className="flex items-center gap-6">
      <span
        className="text-white text-[14rem] font-black leading-none tracking-tighter"
        style={{ fontFamily: 'system-ui, -apple-system, sans-serif', fontWeight: 900 }}
      >
        {timeObj.hours}
      </span>
      <span
        className="text-white/30 text-[14rem] font-extralight leading-none animate-pulse"
        style={{ animationDuration: '2s' }}
      >
        :
      </span>
      <span
        className="text-white text-[14rem] font-black leading-none tracking-tighter"
        style={{ fontFamily: 'system-ui, -apple-system, sans-serif', fontWeight: 900 }}
      >
        {timeObj.minutes}
      </span>
    </div>
  );
};

export default TimeDisplay;