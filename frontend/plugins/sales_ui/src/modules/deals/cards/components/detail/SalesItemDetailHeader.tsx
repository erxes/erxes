import { Button, CopyText, Input, Sheet, useFocusSheet } from 'erxes-ui';

import { DealsActions } from '@/deals/actionBar/components/DealsActions';
import { IDeal } from '@/deals/types/deals';
import {
  IconLayoutSidebarLeftCollapse,
  IconLayoutSidebarLeftExpand,
  IconSettings,
} from '@tabler/icons-react';
import { MoveDealDropdown } from '@/deals/actionBar/components/MoveDealDropdown';
import { useDealsContext } from '@/deals/context/DealContext';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

export const SalesItemDetailHeader = ({ deal }: { deal: IDeal }) => {
  const { editDeals } = useDealsContext();
  const { t } = useTranslation('sales');
  const { isSidebarOpen, setIsSidebarOpen } = useFocusSheet();
  const [name, setName] = useState(deal?.name || 'Untitled deal');
  const boardId = deal.pipeline?.boardId || deal.boardId;
  const pipelineId = deal.pipeline?._id || deal.pipelineId;
  const productConfigUrl =
    boardId && pipelineId
      ? `/settings/sales/deals?${new URLSearchParams({
          activeBoardId: boardId,
          pipelineId,
          tab: 'productConfig',
        }).toString()}`
      : undefined;

  useEffect(() => {
    setName(deal?.name || 'Untitled deal');
  }, [deal?.name]);

  const handleName = () => {
    if (!deal || !name.trim()) return;

    if (name === deal.name) return;

    editDeals({
      variables: {
        _id: deal._id,
        name,
      },
    });
  };

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
        <Sheet.Title>
          <Input
            className="h-auto p-0 border-0 bg-transparent text-lg font-semibold shadow-none focus-visible:ring-1"
            placeholder={t('deal-name')}
            value={name}
            onChange={(e) => {
              setName(e.target.value);
            }}
            onBlur={handleName}
          />
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
        {productConfigUrl && (
          <Button variant="outline" asChild>
            <Link to={productConfigUrl}>
              <IconSettings />
              {t('product-config')}
            </Link>
          </Button>
        )}
        <MoveDealDropdown deal={deal} />
      </div>
      <Sheet.Close />
    </Sheet.Header>
  );
};
