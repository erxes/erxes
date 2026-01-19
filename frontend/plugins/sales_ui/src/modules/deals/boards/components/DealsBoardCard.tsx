import { Separator, useQueryState } from 'erxes-ui';

import { DateSelectDeal } from '@/deals/components/deal-selects/DateSelectDeal';
import DealCardDetails from './DealsBoardCardDetails';
import { IDeal } from '@/deals/types/deals';
import { ItemFooter } from '@/deals/cards/components/item/Footer';
import Labels from '@/deals/cards/components/detail/overview/label/Labels';
import { SelectDealPriority } from '@/deals/components/deal-selects/SelectDealPriority';
import { SelectLabels } from '@/deals/components/common/filters/SelectLabel';
import { dealDetailSheetState } from '@/deals/states/dealDetailSheetState';
import { memo } from 'react';
import { DealsCount } from '../../cards/components/item/DealsCount';
import { useSetAtom } from 'jotai';
import { usePipelineDetail } from '../hooks/usePipelines';

interface DealsBoardCardProps {
  deal: IDeal;
}

export const DealsBoardCard = memo(function DealsBoardCard({
  deal,
}: DealsBoardCardProps) {
  if (!deal) return null;

  const {
    startDate,
    name,
    assignedUsers,
    _id,
    priority,
    createdAt,
    closeDate,
    labels,
    status,
    companies,
    customers,
    tags,
    customProperties,
  } = deal;
  const [, setSalesItemId] = useQueryState<string>('salesItemId');
  const setActiveDealAtom = useSetAtom(dealDetailSheetState);
  const [searchParams] = useQueryState<string>('archivedOnly');

  const onCardClick = () => {
    setSalesItemId(_id);
    setActiveDealAtom(_id);
  };
  const archivedOnly = searchParams === 'true';
  const isArchived = status === 'archived';
  const showArchivedBadge = archivedOnly || isArchived;
  const productMap = new Map(deal.products?.map((p) => [p._id, p]));

  const filterProducts = (tickUsed: boolean) =>
    deal.productsData
      ?.filter((p) => p.tickUsed === tickUsed)
      .map((p) => {
        const product = productMap.get(p.productId || '');
        if (!product) return null;

        return {
          _id: product._id,
          product: product.product,
          name: product.name,
          quantity: p.quantity,
          uom: p.uom,
          unitPrice: p.unitPrice,
        };
      })
      .filter((p): p is NonNullable<typeof p> => p !== null) || [];

  const dealProducts = filterProducts(true);
  const excludedProducts = filterProducts(false);
  const { pipelineDetail } = usePipelineDetail({
    variables: { _id: deal.pipeline._id },
    skip: !deal.pipeline._id,
  });

  const nameConfig = pipelineDetail?.nameConfig;

  const parseName = (template: string, deal: IDeal) => {
    if (!template) return name;

    let parsed = template.replace(/^["']|["']$/g, '');

    const customer = deal.customers?.[0];
    if (customer) {
      parsed = parsed.replace(
        /\{customer\.firstName\}/g,
        customer.firstName || '',
      );
      parsed = parsed.replace(
        /\{customer\.lastName\}/g,
        customer.lastName || '',
      );
      parsed = parsed.replace(
        /\{customer\.primaryEmail\}/g,
        customer?.primaryEmail || '',
      );
      parsed = parsed.replace(
        /\{customer\.primaryPhone\}/g,
        customer?.primaryPhone || '',
      );
    }

    const company = deal.companies?.[0];
    if (company) {
      parsed = parsed.replace(/\{company\.name\}/g, company.primaryName || '');
    }

    return parsed || name;
  };

  return (
    <div
      className={showArchivedBadge ? 'relative overflow-hidden' : ''}
      onClick={() => onCardClick()}
    >
      <div className="flex items-center justify-between h-9 px-1.5">
        <DateSelectDeal
          value={startDate}
          id={_id}
          type="startDate"
          variant="card"
        />
        <DateSelectDeal
          value={closeDate}
          id={_id}
          type="closeDate"
          variant="card"
        />
      </div>
      <Separator />
      <div className="p-3 flex flex-col gap-3">
        {labels && labels.length !== 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <Labels labels={labels} type="toggle" />
          </div>
        )}
        <div className="flex flex-col gap-1">
          <h5 className="font-semibold">{nameConfig ? parseName(nameConfig || '', deal) : name}</h5>
          <DealsCount item={deal} />
        </div>
        <div className="flex flex-wrap gap-1">
          <SelectDealPriority
            dealId={_id}
            value={priority || ''}
            variant="card"
          />
          <SelectLabels.FilterBar
            filterKey=""
            mode="multiple"
            label="By Label"
            variant="card"
            targetId={_id}
            initialValue={labels?.map((label) => label._id || '') || []}
          />
        </div>
      </div>
      <div className="p-3 pt-0">
        <DealCardDetails items={companies} color="#EA475D" />
        <DealCardDetails items={customers} color="#F7CE53" />
        <DealCardDetails items={dealProducts} color="#63D2D6" />
        <DealCardDetails items={excludedProducts} color="#b49cf1" />
        <DealCardDetails color="#FF6600" items={tags || []} />
        <DealCardDetails color="#FF9900" items={customProperties || []} />
      </div>
      <Separator />
      <ItemFooter
        createdAt={createdAt}
        assignedUsers={assignedUsers || []}
        id={_id}
      />{' '}
      {showArchivedBadge && (
        <div className="pointer-events-none select-none absolute bottom-6 -right-10 -rotate-45 w-40">
          <span className="block w-full text-center px-8 py-1 text-xs font-semibold bg-yellow-100 text-yellow-800 border-t border-b border-yellow-200 ">
            Archived
          </span>
        </div>
      )}
    </div>
  );
});
