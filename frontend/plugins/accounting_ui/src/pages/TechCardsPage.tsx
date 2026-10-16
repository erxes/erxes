import { EditTechCard } from '@/settings/tech-cards/components/EditTechCard';
import { TechCardsTable } from '@/settings/tech-cards/components/TechCardsTable';
import { TechCardOutputsTable } from '@/settings/tech-cards/components/TechCardOutputsTable';
import { TechCardFilters } from '@/settings/tech-cards/components/TechCardFilters';
import { PageContainer, PageSubHeader } from 'erxes-ui';

export const TechCardsPage = ({
  unwindOutputs = false,
}: {
  unwindOutputs?: boolean;
}) => {
  return (
    <PageContainer className="flex-1 min-w-0">
      <PageSubHeader>
        <TechCardFilters />
      </PageSubHeader>
      {unwindOutputs ? <TechCardOutputsTable /> : <TechCardsTable />}
      <EditTechCard />
    </PageContainer>
  );
};
