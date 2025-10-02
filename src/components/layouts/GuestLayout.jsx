import LocalEventsCard from '../cards/LocalEventsCard';
import GuestQuoteCard from '../cards/GuestQuoteCard';

const GuestLayout = ({ data }) => {
  return (
    <div className="grid grid-cols-2 gap-8 max-w-4xl mx-auto">
      <LocalEventsCard events={data.localEvents} />
      <GuestQuoteCard />
    </div>
  );
};

export default GuestLayout;