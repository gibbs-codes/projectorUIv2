import { Brain } from 'lucide-react';

const LLMMessageCard = ({ message }) => {
  if (!message.active) return null;

  const urgencyColors = {
    urgent: 'border-red-500 bg-red-500/10',
    attention: 'border-orange-500 bg-orange-500/10',
    suggestion: 'border-blue-500 bg-blue-500/10',
    info: 'border-white/20 bg-black/40'
  };

  return (
    <div className={`border-2 ${urgencyColors[message.urgency]} backdrop-blur-sm p-6 ${message.urgency === 'urgent' ? 'animate-pulse' : ''}`}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <Brain size={24} className="text-white" strokeWidth={1.5} />
        <span className="text-white/40 text-xs tracking-[0.3em] uppercase">Assistant</span>
      </div>

      {/* Message */}
      <p className="text-white text-2xl font-light leading-relaxed">
        {message.message}
      </p>
    </div>
  );
};

export default LLMMessageCard;