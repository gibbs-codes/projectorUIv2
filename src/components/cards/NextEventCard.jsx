import { Car, MapPin } from 'lucide-react';

const NextEventCard = ({ event }) => {
  if (!event) {
    return (
      <div className="relative border-2 border-white/20 bg-black/40 backdrop-blur-sm h-full">
        <div className="p-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-2 h-2 bg-white" />
            <span className="text-white/40 text-xs tracking-[0.3em] uppercase">Next Event</span>
          </div>
          <h3 className="text-white text-4xl font-bold tracking-tight mb-3">
            No upcoming events
          </h3>
        </div>
      </div>
    );
  }

  const commuteTime = event.commuteTime || 0;
  const isUrgent = commuteTime > 0 && commuteTime >= event.minutesUntil - 5;

  return (
    <div className={`relative border-2 ${isUrgent ? 'border-orange-500 animate-pulse' : 'border-white/20'} bg-black/40 backdrop-blur-sm h-full`}>
      {/* Decorative corner block */}
      <div className={`absolute top-0 left-0 w-24 h-24 ${isUrgent ? 'bg-orange-500' : 'bg-white'} mix-blend-overlay opacity-10`} />

      <div className="p-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className={`w-2 h-2 ${isUrgent ? 'bg-orange-500 animate-pulse' : 'bg-white'}`} />
          <span className="text-white/40 text-xs tracking-[0.3em] uppercase">Next Event</span>
        </div>

        {/* Event title */}
        <h3 className="text-white text-4xl font-bold tracking-tight mb-3">
          {event.title}
        </h3>

        {/* Time and countdown */}
        <div className="flex items-baseline gap-4 mb-6">
          <span className="text-white text-3xl font-light">{event.time}</span>
          <span className="text-white/50 text-lg">IN {event.minutesUntil} MIN</span>
        </div>

        {/* Commute section - only show if location exists */}
        {event.location && (
          <div className={`flex items-center gap-3 p-4 border ${isUrgent ? 'border-orange-500/50 bg-orange-500/10' : 'border-white/10'}`}>
            <Car className={isUrgent ? 'text-orange-400' : 'text-white/70'} size={32} strokeWidth={1.5} />
            <div>
              <div className={`text-2xl font-bold ${isUrgent ? 'text-orange-400' : 'text-white'}`}>
                {isUrgent ? 'LEAVE NOW' : commuteTime > 0 ? `${commuteTime} min` : 'No commute needed'}
              </div>
              <div className="text-white/50 text-sm flex items-center gap-2">
                <MapPin size={12} />
                {event.location}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NextEventCard;