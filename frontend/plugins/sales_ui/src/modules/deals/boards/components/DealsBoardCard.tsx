import { Labels } from '@/deals/cards/components/detail/overview/label/Labels';
import { ItemFooter } from '@/deals/cards/components/item/Footer';
import { useDealsEdit } from '@/deals/cards/hooks/useDeals';
import { SelectLabels } from '@/deals/components/common/filters/SelectLabel';
import { DateSelectDeal } from '@/deals/components/deal-selects/DateSelectDeal';
import { SelectDealPriority } from '@/deals/components/deal-selects/SelectDealPriority';
import { DealLoyaltyPointsBadge } from '@/deals/loyaltyRules/components/DealLoyaltyTotals';
import { useOpenDealPanel } from '@/deals/hooks/useOpenDealPanel';
import { IDeal } from '@/deals/types/deals';
import { IconAlertCircleFilled } from '@tabler/icons-react';
import { CopyText, isDefined, Separator, useQueryState } from 'erxes-ui';
import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  SelectCompanyFilterBar,
  SelectCustomerFilterBar,
} from 'ui-modules/modules/contacts';
import { SelectTagsFilterBar } from 'ui-modules/modules/tags';
import { DealsBoardCardInfo } from './DealsBoardCardInfo';

interface DealsBoardCardProps {
  deal: IDeal;
}

const normalizeSelectedIds = (value?: string | string[]) => {
  if (!value) {
    return [];
  }

  return Array.isArray(value) ? value : [value];
};

export const DealsBoardCard = memo(function DealsBoardCard({
  deal,
}: DealsBoardCardProps) {
  const openDealPanel = useOpenDealPanel();
  const [searchParams] = useQueryState<string>('archivedOnly');
  const { editDeals } = useDealsEdit();
  const [currentCustomers, setCurrentCustomers] = useState(
    deal.customers
      ?.filter(isDefined)
      .map(({ _id }) => _id)
      .filter(isDefined)
      .slice(0, 1) || [],
  );
  const [currentCompanies, setCurrentCompanies] = useState(
    deal.companies
      ?.filter(isDefined)
      .map(({ _id }) => _id)
      .filter(isDefined)
      .slice(0, 1) || [],
  );
  const { t } = useTranslation('sales');

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
    openDealPanel(_id);
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
          placeholder={t('start-date')}
          value={startDate}
          id={_id}
          type="startDate"
          variant="card"
        />
        <DateSelectDeal
          placeholder={t('close-date')}
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
            <Labels labels={labels.filter(isDefined)} type="toggle" />
          </div>
        )}
        <div className="flex flex-col gap-1">
          <h5 className="font-semibold">
            <CopyText value={name || ''} className="hover:opacity-70 text-left">
              {name}
            </CopyText>
          </h5>
          {stage?.age != null && stage.age < 0 && (
            <span className="px-2 rounded flex gap-1 bg-yellow-50 text-yellow-400 border-yellow-100 border">
              <IconAlertCircleFilled className="size-6 pt-2" />
              <h5 className="text-sm py-2">
                {t('ready-to-move-card', { count: Math.abs(stage.age) })}
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
            variant="card"
            targetId={_id}
            initialValue={
              labels?.filter(isDefined).map((label) => label._id || '') || []
            }
            showLabels
          />
          <SelectTagsFilterBar
            filterKey=""
            mode="multiple"
            label={t('by-tag')}
            variant="card"
            tagType="sales:deal"
            initialValue={tagIds?.filter(isDefined) || []}
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
          <SelectCustomerFilterBar
            filterKey=""
            mode="multiple"
            label={t('by-customer', 'By Customer')}
            variant="card"
            initialValue={currentCustomers}
            value={currentCustomers}
            onValueChange={(value?: string | string[]) => {
              // One per deal: the latest pick replaces it.
              const selectedId = normalizeSelectedIds(value).at(-1) ?? null;

              setCurrentCustomers(selectedId ? [selectedId] : []);

              editDeals({ variables: { _id, customerId: selectedId } });
            }}
            hideAvatar
          />
          <SelectCompanyFilterBar
            filterKey=""
            mode="multiple"
            label={t('by-company')}
            variant="card"
            targetId={_id}
            initialValue={currentCompanies}
            value={currentCompanies}
            onValueChange={(value?: string | string[]) => {
              // One per deal: the latest pick replaces it.
              const selectedId = normalizeSelectedIds(value).at(-1) ?? null;

              setCurrentCompanies(selectedId ? [selectedId] : []);

              editDeals({ variables: { _id, companyId: selectedId } });
            }}
            hideAvatar
          />
        </div>
      </div>
      <DealsBoardCardInfo deal={deal} />
      <Separator />
      <ItemFooter
        number={number}
        createdAt={createdAt}
        assignedUsers={assignedUsers || []}
        id={_id}
      />
      <DealLoyaltyPointsBadge dealId={_id} />
      {showArchivedBadge && (
        <div className="pointer-events-none select-none absolute bottom-6 -right-10 -rotate-45 w-40">
          <span className="block w-full text-center px-8 py-1 text-xs font-semibold bg-yellow-100 text-yellow-800 border-t border-b border-yellow-200 ">
            {t('archived')}
          </span>
        </div>
      )}
    </div>
  );
});
