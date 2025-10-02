import { Sparkles } from 'lucide-react';

const GuestQuoteCard = () => {
  return (
    <div className="border-2 border-white/20 bg-black/40 backdrop-blur-sm p-8">
      <Sparkles size={32} className="text-white/60 mb-4" strokeWidth={1.5} />
      <p className="text-white text-3xl font-light leading-relaxed mb-4">
        "The purpose of art is washing the dust of daily life off our souls."
      </p>
      <p className="text-white/50 text-lg tracking-wider uppercase">
        — Pablo Picasso
      </p>
    </div>
  );
};

export default GuestQuoteCard;