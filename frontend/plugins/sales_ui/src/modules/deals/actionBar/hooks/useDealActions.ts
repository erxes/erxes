import { useConfirm } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

import {
  useDealsCopy,
  useDealsEdit,
  useDealsRemove,
  useDealsWatch,
} from '@/deals/cards/hooks/useDeals';
import { GET_DEAL_DETAIL } from '@/deals/graphql/queries/DealsQueries';
import { IDeal } from '@/deals/types/deals';

export const useDealActions = ({
  deals,
  selectedCount,
}: {
  deals: IDeal[];
  selectedCount?: number;
}) => {
  const { confirm } = useConfirm();
  const { t } = useTranslation('sales');
  const { editDeals, loading: editLoading } = useDealsEdit();
  const { removeDeals, loading: removeLoading } = useDealsRemove();
  const { copyDeals, loading: copyLoading } = useDealsCopy();
  const { watchDeals, loading: watchLoading } = useDealsWatch();

  const count = selectedCount || deals.length;
  const isSingle = count === 1;
  const dealIds = deals.map((deal) => deal._id);

  const allArchived = deals.every((deal) => deal.status === 'archived');
  const allActive = deals.every((deal) => deal.status === 'active');
  const allWatched = deals.every((deal) => deal.isWatched === true);
  const allUnwatched = deals.every((deal) => deal.isWatched === false);
  const showRemove = deals.every((deal) => deal.status === 'archived');

  let archiveLabel = t('archive-mixed');

  if (allArchived) {
    archiveLabel = t('unarchive');
  } else if (allActive || isSingle) {
    archiveLabel = t('archive');
  }

  let watchLabel = t('watch-mixed');

  if (allWatched) {
    watchLabel = t('unwatch');
  } else if (allUnwatched) {
    watchLabel = t('watch');
  }

  const handleArchive = async () => {
    if (!isSingle) {
      await confirm({
        message: t('archive-deals-confirm', {
          count,
          action: archiveLabel,
        }),
      });
    }

    await Promise.all(
      dealIds.map((id) =>
        editDeals({
          variables: {
            _id: id,
            status: allArchived ? 'active' : 'archived',
          },
        }),
      ),
    );
  };

  const handleRemove = async () => {
    await confirm({
      message: t('remove-deals-confirm', { count }),
    });

    await Promise.all(
      dealIds.map((id) => removeDeals({ variables: { _id: id } })),
    );
  };

  const handleCopy = async () => {
    await Promise.all(
      dealIds.map((id) => copyDeals({ variables: { _id: id } })),
    );
  };

  const handleWatch = async () => {
    const isWatched = !allWatched;

    await Promise.all(
      dealIds.map((id) =>
        watchDeals({
          variables: {
            _id: id,
            isAdd: isWatched,
          },
          optimisticResponse: {
            dealsWatch: {
              __typename: 'Deal',
              _id: id,
              isWatched,
            },
          },
          update: (cache) => {
            const detail = cache.readQuery<{ dealDetail: IDeal }>({
              query: GET_DEAL_DETAIL,
              variables: { _id: id },
            });

            if (!detail?.dealDetail) {
              return;
            }

            cache.writeQuery({
              query: GET_DEAL_DETAIL,
              variables: { _id: id },
              data: {
                dealDetail: {
                  ...detail.dealDetail,
                  isWatched,
                },
              },
            });
          },
        }),
      ),
    );
  };

  return {
    archiveLabel,
    count,
    handleArchive,
    handleCopy,
    handleRemove,
    handleWatch,
    isLoading: editLoading || removeLoading || copyLoading || watchLoading,
    isSingle,
    showRemove,
    watchLabel,
  };
};
