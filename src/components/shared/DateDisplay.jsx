const DateDisplay = ({ dateObj }) => {
  return (
    <div className="space-y-1">
      <div className="text-white/40 text-xl tracking-[0.3em] font-light">
        {dateObj.weekday}
      </div>
      <div className="flex items-baseline gap-4">
        <div className="text-white text-7xl font-bold leading-none tracking-tighter">
          {dateObj.day}
        </div>
        <div className="text-white/60 text-3xl tracking-[0.2em] font-light mb-2">
          {dateObj.month}
        </div>
      </div>
    </div>
  );
};

export default DateDisplay;