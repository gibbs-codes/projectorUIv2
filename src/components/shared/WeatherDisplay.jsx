import { Cloud } from 'lucide-react';

const WeatherDisplay = ({ weather }) => {
  return (
    <div className="text-right space-y-2">
      <div className="flex items-center justify-end gap-4">
        <Cloud size={40} className="text-white/80" strokeWidth={1.5} />
        <div className="text-white text-6xl font-extralight tracking-tight">
          {weather.temp}°
        </div>
      </div>
      <div className="text-white/50 text-lg tracking-wide font-light uppercase">
        {weather.condition}
      </div>
    </div>
  );
};

export default WeatherDisplay;