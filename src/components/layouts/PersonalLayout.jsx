import NextEventCard from '../cards/NextEventCard';
import TodoCard from '../cards/TodoCard';
import AgendaCard from '../cards/AgendaCard';
import LocalEventsCard from '../cards/LocalEventsCard';
import LLMMessageCard from '../cards/LLMMessageCard';

const PersonalLayout = ({ data }) => {
  return (
    <div className="grid grid-cols-12 gap-6 h-[calc(100vh-400px)]">
      {/* Left column - 2 cards stacked */}
      <div className="col-span-4 flex flex-col gap-6">
        <div className="flex-1">
          <TodoCard todos={data.todos} />
        </div>
        <div className="flex-1">
          <LocalEventsCard events={data.localEvents} />
        </div>
      </div>
      
      {/* Middle column - Large event card */}
      <div className="col-span-5">
        <NextEventCard event={data.nextEvent} />
      </div>
      
      {/* Right column - Agenda + LLM */}
      <div className="col-span-3 flex flex-col gap-6">
        <div className="flex-[2]">
          <AgendaCard agenda={data.agenda} />
        </div>
        {data.llmMessage?.active && (
          <div className="flex-1">
            <LLMMessageCard message={data.llmMessage} />
          </div>
        )}
      </div>
    </div>
  );
};

export default PersonalLayout;