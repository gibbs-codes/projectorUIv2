import { CheckCircle2 } from 'lucide-react';

const AgendaCard = ({ agenda }) => {
  return (
    <div className="border-2 border-white/20 bg-black/40 p-6 h-full">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-3 h-3 bg-white"></div>
        <h2 className="text-white uppercase tracking-wide font-medium text-sm">
          Today's Agenda
        </h2>
      </div>

      {/* Agenda Items */}
      <div className="space-y-6">
        {agenda?.map((item, index) => (
          <div key={index} className="flex items-start gap-4">
            <div className="text-white/60 text-lg font-light min-w-[80px]">
              {item.time}
            </div>
            <div className="flex-1">
              <div className={`text-white text-xl ${item.done ? 'line-through opacity-50' : ''}`}>
                {item.title}
              </div>
            </div>
            {item.done && <CheckCircle2 size={20} className="text-green-400 mt-1" />}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AgendaCard;