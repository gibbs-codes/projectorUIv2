import { Music, Utensils } from 'lucide-react';

const LocalEventsCard = ({ events }) => {
  const getEventIcon = (type) => {
    switch (type) {
      case 'music':
        return <Music size={28} className="text-purple-400" strokeWidth={1.5} />;
      case 'food':
        return <Utensils size={28} className="text-orange-400" strokeWidth={1.5} />;
      default:
        return null;
    }
  };

  return (
    <div className="border-2 border-white/20 bg-black/40 p-6 h-full">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-3 h-3 bg-white"></div>
        <h2 className="text-white uppercase tracking-wide font-medium text-sm">
          Local Events
        </h2>
      </div>

      {/* Events List */}
      <div className="space-y-5">
        {events?.map((event, index) => (
          <div key={index} className="flex items-start gap-4">
            {getEventIcon(event.type)}
            <div>
              <div className="text-white text-xl font-medium">
                {event.title}
              </div>
              <div className="text-white/50 text-sm">
                {event.time}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LocalEventsCard;