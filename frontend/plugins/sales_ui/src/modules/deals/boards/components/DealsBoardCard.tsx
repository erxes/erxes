import {
  SelectCompany,
  SelectCustomer,
  SelectTags,
  useManageRelations,
} from 'ui-modules';
import { Separator, useQueryState } from 'erxes-ui';

import { DateSelectDeal } from '@/deals/components/deal-selects/DateSelectDeal';
import DealCardDetails from './DealsBoardCardDetails';
import { IDeal } from '@/deals/types/deals';
import { IconAlertCircleFilled } from '@tabler/icons-react';
import { ItemFooter } from '@/deals/cards/components/item/Footer';
import Labels from '@/deals/cards/components/detail/overview/label/Labels';
import { SelectDealPriority } from '@/deals/components/deal-selects/SelectDealPriority';
import { SelectLabels } from '@/deals/components/common/filters/SelectLabel';
import { dealDetailSheetState } from '@/deals/states/dealDetailSheetState';
import { memo } from 'react';
import { useDealsEdit } from '@/deals/cards/hooks/useDeals';
import { useSetAtom } from 'jotai';
import { useState } from 'react';

interface DealsBoardCardProps {
  deal: IDeal;
}

const CardDetails = ({ deal }: { deal: IDeal }) => {
  const { companies, customers, tags, customProperties } = deal;

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

  if (
    !dealProducts?.length &&
    !excludedProducts?.length &&
    !companies?.length &&
    !customers?.length &&
    !tags?.length &&
    !customProperties?.length
  ) {
    return null;
  }

  return (
    <div className="p-3 pt-0">
      <DealCardDetails items={companies} color="#EA475D" />
      <DealCardDetails items={customers} color="#F7CE53" />
      <DealCardDetails items={dealProducts} color="#63D2D6" />
      <DealCardDetails items={excludedProducts} color="#b49cf1" />
      <DealCardDetails color="#FF6600" items={tags || []} />
      <DealCardDetails color="#FF9900" items={customProperties || []} />
    </div>
  );
};

export const DealsBoardCard = memo(function DealsBoardCard({
  deal,
}: DealsBoardCardProps) {
  const [, setSalesItemId] = useQueryState<string>('salesItemId');
  const setActiveDealAtom = useSetAtom(dealDetailSheetState);
  const [searchParams] = useQueryState<string>('archivedOnly');
  const { editDeals } = useDealsEdit();
  const { manageRelations } = useManageRelations();
  const [currentCustomers, setCurrentCustomers] = useState(
    deal.customers || [],
  );
  const [currentCompanies, setCurrentCompanies] = useState(
    deal.companies || [],
  );

  if (!deal) return null;

  const {
    startDate,
    name,
    number,
    assignedUsers,
    _id,
    priority,
    createdAt,
    closeDate,
    labels,
    status,
    stage,
    tagIds,
  } = deal;

  const onCardClick = () => {
    setSalesItemId(_id);
    setActiveDealAtom(_id);
  };
  const archivedOnly = searchParams === 'true';
  const isArchived = status === 'archived';
  const showArchivedBadge = archivedOnly || isArchived;

  return (
    <div
      className={showArchivedBadge ? 'relative overflow-hidden' : ''}
      onClick={() => onCardClick()}
    >
      <div className="flex items-center justify-between h-9 px-1.5">
        <DateSelectDeal
          placeholder="Start Date"
          value={startDate}
          id={_id}
          type="startDate"
          variant="card"
        />
        <DateSelectDeal
          placeholder="Close Date"
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
          <h5 className="font-semibold">{name}</h5>
          {stage?.age !== undefined && stage.age < 0 && (
            <span className="px-2 rounded flex gap-1 bg-yellow-50 text-yellow-400 border-yellow-100 border">
              <IconAlertCircleFilled className="size-6 pt-2" />
              <h5 className="text-sm py-2">
                Ready to move this card to the next column? (
                {Math.abs(stage.age)}{' '}
                {Math.abs(stage.age) === 1 ? 'day' : 'days'} elapsed)
              </h5>
            </span>
          )}
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
          <SelectTags.FilterBar
            filterKey=""
            mode="multiple"
            label="By Tag"
            variant="card"
            targetId={_id}
            tagType="sales:deal"
            initialValue={tagIds || []}
            onValueChange={(value) => {
              if (!value) return;
              editDeals({
                variables: {
                  _id: deal._id,
                  tagIds: Array.isArray(value) ? value : [value],
                },
              });
            }}
          />
          <SelectCustomer.FilterBar
            filterKey=""
            mode="multiple"
            label="By Customer"
            variant="card"
            targetId={_id}
            initialValue={
              currentCustomers?.map((customer) => customer._id || '') || []
            }
            value={
              currentCustomers?.map((customer) => customer._id || '') || []
            }
            onValueChange={(value: any) => {
              if (!value) return;

              const updatedCustomers = (value || []).map(
                (id: string) =>
                  currentCustomers?.find((c) => c._id === id) || { _id: id },
              );
              setCurrentCustomers(updatedCustomers);

              manageRelations({
                contentType: 'sales:deal',
                contentId: _id,
                relatedContentType: 'core:customer',
                relatedContentIds: value || [],
              });
            }}
            hideAvatar
          />
          <SelectCompany.FilterBar
            filterKey=""
            mode="multiple"
            label="By Company"
            variant="card"
            targetId={_id}
            initialValue={
              currentCompanies?.map((company) => company._id || '') || []
            }
            value={currentCompanies?.map((company) => company._id || '') || []}
            onValueChange={(value: any) => {
              if (!value) return;

              const updatedCompanies = (value || []).map(
                (id: string) =>
                  currentCompanies?.find((c) => c._id === id) || { _id: id },
              );
              setCurrentCompanies(updatedCompanies);

              manageRelations({
                contentType: 'sales:deal',
                contentId: _id,
                relatedContentType: 'core:company',
                relatedContentIds: value || [],
              });
            }}
            hideAvatar
          />
        </div>
      </div>
      <CardDetails deal={deal} />
      <Separator />
      <ItemFooter
        number={number}
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
