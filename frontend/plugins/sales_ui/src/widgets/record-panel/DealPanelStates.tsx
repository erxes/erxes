import { useDealDetail } from '@/deals/cards/hooks/useDeals';
import { IDealDetail } from '@/deals/types/deals';
import { IconAlertCircle, IconCloudExclamation } from '@tabler/icons-react';
import { Empty, Spinner } from 'erxes-ui';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

export const DealPanelError = ({ error }: { error: Error }) => {
  const { t } = useTranslation('sales');

  return (
    <Empty className="py-12">
      <Empty.Header>
        <Empty.Media variant="icon">
          <IconAlertCircle />
        </Empty.Media>
        <Empty.Title>{t('error')}</Empty.Title>
        <Empty.Description>{error.message}</Empty.Description>
      </Empty.Header>
    </Empty>
  );
};

export const DealPanelNotFound = () => {
  const { t } = useTranslation('sales');

  return (
    <Empty className="py-12">
      <Empty.Header>
        <Empty.Media variant="icon">
          <IconCloudExclamation />
        </Empty.Media>
        <Empty.Title>{t('deal-not-found')}</Empty.Title>
        <Empty.Description>{t('no-deal-with-id')}</Empty.Description>
      </Empty.Header>
    </Empty>
  );
};

type TDealRefetch = ReturnType<typeof useDealDetail>['refetch'];

export const DealPanelLoader = ({
  dealId,
  live = false,
  children,
}: {
  dealId: string;
  live?: boolean;
  children: (deal: IDealDetail, refetch: TDealRefetch) => ReactNode;
}) => {
  const { deal, loading, error, refetch } = useDealDetail(
    {
      variables: { _id: dealId },
      ...(live ? {} : { fetchPolicy: 'cache-first' }),
    },
    { subscribe: live },
  );

  if (loading && !deal) {
    return <Spinner containerClassName="py-12" />;
  }

  if (error && !deal) {
    return <DealPanelError error={error} />;
  }

  if (!deal) {
    return <DealPanelNotFound />;
  }

  return children(deal, refetch);
};
