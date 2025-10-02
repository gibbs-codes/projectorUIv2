import AgendaCard from '../cards/AgendaCard';
import TodoCard from '../cards/TodoCard';

const BriefingLayout = ({ data }) => {
  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Greeting and Summary */}
      <div className="text-center mb-12">
        <h2 className="text-white text-5xl font-light mb-2">
          {data.briefing.greeting}
        </h2>
        <p className="text-white/60 text-2xl">
          {data.briefing.summary}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-6 mb-8">
        {Object.entries(data.briefing.stats).map(([key, value]) => (
          <div key={key} className="border-2 border-white/20 bg-black/40 backdrop-blur-sm p-6 text-center">
            <div className="text-white text-4xl font-bold mb-2">{value}</div>
            <div className="text-white/50 text-sm tracking-wider uppercase">{key}</div>
          </div>
        ))}
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-2 gap-6">
        <AgendaCard agenda={data.agenda} />
        <TodoCard todos={data.todos} />
      </div>
    </div>
  );
};

export default BriefingLayout;