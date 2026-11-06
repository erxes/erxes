import { DealsActions } from '@/deals/actionBar/components/DealsActions';
import {
  MoveDealDropdown,
  MoveDealSubmenu,
} from '@/deals/actionBar/components/MoveDealDropdown';
import { useDealDetail } from '@/deals/cards/hooks/useDeals';
import { DealsProvider } from '@/deals/context/DealContext';
import { IconSettings } from '@tabler/icons-react';
import { Button, DropdownMenu } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

export const DealPanelActions = ({
  dealId,
  expanded = false,
}: {
  dealId: string;
  expanded?: boolean;
}) => {
  const { t } = useTranslation('sales');
  const { deal } = useDealDetail(
    { variables: { _id: dealId }, fetchPolicy: 'cache-first' },
    { subscribe: false },
  );

  if (!deal) {
    return null;
  }

  const boardId = deal.pipeline?.boardId || deal.boardId;
  const pipelineId = deal.pipeline?._id || deal.pipelineId;
  const productConfigUrl =
    boardId && pipelineId
      ? `/sales/settings/deals?${new URLSearchParams({
          activeBoardId: boardId,
          pipelineId,
          tab: 'productConfig',
        }).toString()}`
      : undefined;

  if (expanded) {
    return (
      <DealsProvider>
        <div className="flex items-center gap-1 [&_button]:h-7 [&_button]:text-xs">
          {productConfigUrl && (
            <Button
              variant="outline"
              size="icon"
              className="size-7"
              title={t('product-config')}
              aria-label={t('product-config')}
              asChild
            >
              <Link to={productConfigUrl}>
                <IconSettings className="size-4" />
              </Link>
            </Button>
          )}
          <MoveDealDropdown deal={deal} />
        </div>
      </DealsProvider>
    );
  }

  return (
    <DealsProvider>
      <div className="flex items-center gap-1 [&_button]:h-7 [&_button]:text-xs">
        <DealsActions
          deals={[deal]}
          variant="menu"
          menuItems={
            <>
              <MoveDealSubmenu deal={deal} />
              {productConfigUrl && (
                <DropdownMenu.Item asChild>
                  <Link to={productConfigUrl}>
                    <IconSettings />
                    {t('product-config')}
                  </Link>
                </DropdownMenu.Item>
              )}
            </>
          }
        />
      </div>
    </DealsProvider>
  );
};
