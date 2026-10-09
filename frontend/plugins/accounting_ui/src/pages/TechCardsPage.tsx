import { EditTechCard } from '@/settings/tech-cards/components/EditTechCard';
import { TechCardsTable } from '@/settings/tech-cards/components/TechCardsTable';

export const TechCardsPage = () => {
  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex-auto p-3 overflow-hidden flex">
        <TechCardsTable />
      </div>
      <EditTechCard />
    </div>
  );
};
