import { Button, CopyText, Sheet, useFocusSheet } from 'erxes-ui';

import { DealsActions } from '@/deals/actionBar/components/DealsActions';
import { IDeal } from '@/deals/types/deals';
import {
  IconLayoutSidebarLeftCollapse,
  IconLayoutSidebarLeftExpand,
} from '@tabler/icons-react';
import { MoveDealDropdown } from '@/deals/actionBar/components/MoveDealDropdown';
import { useTranslation } from 'react-i18next';

export const SalesItemDetailHeader = ({ deal }: { deal: IDeal }) => {
  const { t } = useTranslation('sales');
  const { isSidebarOpen, setIsSidebarOpen } = useFocusSheet();
  const name = deal?.name || 'Untitled deal';

  return (
    <Sheet.Header className="gap-2 flex-row items-center space-y-0">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
      >
        {isSidebarOpen ? (
          <IconLayoutSidebarLeftCollapse />
        ) : (
          <IconLayoutSidebarLeftExpand />
        )}
      </Button>
      <div className="flex flex-col flex-1 min-w-0">
        <Sheet.Title className="text-lg font-semibold truncate">
          {name}
        </Sheet.Title>
        {deal?.number && (
          <CopyText
            value={deal.number}
            className="text-xs text-muted-foreground hover:text-foreground hover:opacity-100 text-left"
          >
            #{deal.number}
          </CopyText>
        )}
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {deal?.status === 'archived' && (
          <span className="text-sm py-1 px-2 bg-yellow-100 text-yellow-800 border border-yellow-200 rounded-sm whitespace-nowrap ">
            {t('archived')}
          </span>
        )}
        <DealsActions deals={[deal]} />
        <MoveDealDropdown deal={deal} />
      </div>
      <Sheet.Close />
    </Sheet.Header>
  );
};
