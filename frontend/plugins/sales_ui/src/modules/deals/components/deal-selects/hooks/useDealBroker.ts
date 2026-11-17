import { useOptimisticField } from '@/deals/components/deal-selects/hooks/useOptimisticField';
import { IDealDetail } from '@/deals/types/deals';
import { useState } from 'react';

export type DealBrokerType = NonNullable<IDealDetail['brokerType']> | '';

export interface DealBrokerSelection {
  id: string;
  type: DealBrokerType;
}

const toDealBrokerType = (value: string): DealBrokerType =>
  value === 'customer' || value === 'company' || value === 'user' ? value : '';

const areBrokerSelectionsEqual = (
  left: DealBrokerSelection,
  right: DealBrokerSelection,
) => left.id === right.id && left.type === right.type;

export const useDealBroker = ({
  deal,
  onCommit,
}: {
  deal: IDealDetail;
  onCommit: (value: DealBrokerSelection) => PromiseLike<unknown>;
}) => {
  const broker = useOptimisticField<DealBrokerSelection>({
    value: { id: deal.brokerId || '', type: deal.brokerType || '' },
    resetKey: deal._id,
    isEqual: areBrokerSelectionsEqual,
    onCommit,
  });
  const [pending, setPending] = useState<{
    dealId: string;
    type: DealBrokerType;
  } | null>(null);
  const pendingType = pending?.dealId === deal._id ? pending.type : null;
  const type = pendingType ?? broker.value.type;
  const id = pendingType ? '' : broker.value.id;

  const setType = (value: string) => {
    const nextType = toDealBrokerType(value);

    if (!nextType) {
      setPending(null);
      broker.setValue({ id: '', type: '' });
      return;
    }

    setPending(
      nextType === broker.value.type
        ? null
        : { dealId: deal._id, type: nextType },
    );
  };

  const setId = (value: string) => {
    if (!value) {
      setPending(type ? { dealId: deal._id, type } : null);
      broker.setValue({ id: '', type: '' });
      return;
    }

    setPending(null);
    broker.setValue({ id: value, type });
  };

  return { type, id, setType, setId };
};
