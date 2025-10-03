import { Card } from '@/deals/cards/components/item/Card';
import { CardsLoading } from '@/deals/components/loading/CardsLoading';
import { EnumCursorDirection } from 'erxes-ui';
import { IDeal } from '@/deals/types/deals';
import { useDeals } from '@/deals/cards/hooks/useDeals';
import { useEffect } from 'react';
import { useInView } from 'react-intersection-observer';

type Props = {
  stageId: string;
};

export const CardList = ({ stageId }: Props) => {
  const { ref: triggerRef, inView: isTriggerInView } = useInView({
    triggerOnce: true,
  });

  const { ref: loadMoreRef, inView: isLoadMoreVisible } = useInView({
    rootMargin: '200px',
    threshold: 0,
  });

  const {
    list,
    loading: dealsLoading,
    handleFetchMore,
    hasNextPage,
  } = useDeals({
    variables: {
      stageId,
    },
    skip: !isTriggerInView,
    fetchPolicy: 'cache-and-network',
  });

  useEffect(() => {
    if (isLoadMoreVisible && hasNextPage) {
      handleFetchMore({ direction: EnumCursorDirection.FORWARD });
    }
  }, [isLoadMoreVisible, hasNextPage, handleFetchMore]);

  return (
    <div ref={triggerRef} className="space-y-2">
      {dealsLoading ? (
        <CardsLoading />
      ) : (
        <>
          {(list || ([] as IDeal[])).map((deal) => (
            <Card key={deal._id} card={deal} />
          ))}

          {hasNextPage && (
            <div ref={loadMoreRef}>
              <CardsLoading />
            </div>
          )}
        </>
      )}
    </div>
  );
};
