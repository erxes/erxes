import { Labels } from '@/deals/cards/components/detail/overview/label/Labels';
import { ItemFooter } from '@/deals/cards/components/item/Footer';
import { useDealsEdit } from '@/deals/cards/hooks/useDeals';
import { SelectLabels } from '@/deals/components/common/filters/SelectLabel';
import { DateSelectDeal } from '@/deals/components/deal-selects/DateSelectDeal';
import { SelectDealPriority } from '@/deals/components/deal-selects/SelectDealPriority';
import { dealDetailSheetState } from '@/deals/states/dealDetailSheetState';
import { IDeal } from '@/deals/types/deals';
import { IconAlertCircleFilled } from '@tabler/icons-react';
import { CopyText, Separator, useQueryState } from 'erxes-ui';
import { useSetAtom } from 'jotai';
import { memo, useState } from 'react';
import {
  SelectCompanyFilterBar,
  SelectCustomerFilterBar,
} from 'ui-modules/modules/contacts';
import { SelectTagsFilterBar } from 'ui-modules/modules/tags';
import { useManageRelations } from 'ui-modules';
import type { IField } from 'ui-modules';
import { useFields } from 'ui-modules';
import {
  type DealCardDetailItem,
  DealCardDetails,
  DealCardProducts,
  DealCardRelationDetails,
} from './DealsBoardCardDetails';
import { useTranslation } from 'react-i18next';

interface DealsBoardCardProps {
  deal: IDeal;
}

interface DealProductReference {
  _id: string;
  name?: string;
}

const normalizeSelectedIds = (value?: string | string[]) => {
  if (!value) {
    return [];
  }

  return Array.isArray(value) ? value : [value];
};

const hasFieldValue = (value: unknown) => {
  if (value === null || value === undefined || value === '') return false;
  if (Array.isArray(value) && value.length === 0) return false;
  return true;
};

const formatFieldValue = (field: IField, value: unknown): string => {
  if (Array.isArray(value)) {
    if (field.options?.length) {
      return value
        .map(
          (v) =>
            field.options?.find((option) => option.value === v)?.label ??
            String(v),
        )
        .join(', ');
    }
    return value.join(', ');
  }
  if (field.options?.length) {
    return (
      field.options.find((option) => option.value === value)?.label ??
      String(value)
    );
  }
  if (field.type === 'boolean' || field.type === 'check') {
    return value ? 'Yes' : 'No';
  }
  if (field.type === 'date') {
    const date = new Date(value as string);
    return Number.isNaN(date.getTime())
      ? String(value)
      : date.toLocaleDateString();
  }
  return String(value);
};

const normalizeCustomProperty = (
  property: unknown,
  index: number,
): DealCardDetailItem | null => {
  if (typeof property !== 'object' || property === null) {
    return null;
  }

  const name = Reflect.get(property, 'name');

  if (typeof name !== 'string' || !name.trim()) {
    return null;
  }

  const id = Reflect.get(property, '_id');
  const colorCode = Reflect.get(property, 'colorCode');

  return {
    _id: typeof id === 'string' ? id : `custom-property-${index}`,
    name: name.trim(),
    colorCode: typeof colorCode === 'string' ? colorCode : undefined,
  };
};

const CardDetails = ({ deal }: { deal: IDeal }) => {
  const { t } = useTranslation('sales');
  const {
    branches,
    companies,
    customers,
    departments,
    tags,
    customProperties,
  } = deal;
  const { fields: dealFields } = useFields({ contentType: 'sales:deal' });

  const cardPropertyItems = (dealFields || [])
    .filter(
      (field) =>
        field.isVisibleInCard &&
        hasFieldValue(deal.propertiesData?.[field._id]),
    )
    .map((field) => ({
      _id: field._id,
      name: `${field.name}: ${formatFieldValue(field, deal.propertiesData?.[field._id])}`,
    }));

  const productMap = new Map(
    deal.products?.map((product: DealProductReference) => [
      product._id,
      product,
    ]),
  );

  const filterProducts = (tickUsed: boolean) => {
    return (
      deal.productsData
        ?.filter((p) => p.tickUsed === tickUsed)
        .map((p) => {
          const product = productMap.get(p.productId || '');
          if (!product) return null;

          return {
            _id: p._id,
            name: product.name || t('unknown-product'),
            quantity: p.quantity || 0,
            unitPrice: p.unitPrice || 0,
            amount:
              typeof p.amount === 'number'
                ? p.amount
                : (p.unitPrice || 0) * (p.quantity || 0),
            currency: p.currency,
          };
        })
        .filter((p): p is NonNullable<typeof p> => Boolean(p)) || []
    );
  };

  const dealProducts = filterProducts(true);
  const excludedProducts = filterProducts(false);
  const hasProducts = dealProducts.length > 0 || excludedProducts.length > 0;
  const customerItems = (customers || []).map((customer) => ({
    _id: customer._id,
    name:
      [customer.firstName, customer.middleName, customer.lastName]
        .filter(Boolean)
        .join(' ') ||
      customer.primaryEmail ||
      customer.primaryPhone ||
      t('unknown'),
    avatar: customer.avatar,
  }));
  const companyItems = (companies || []).map((company) => ({
    _id: company._id,
    name:
      company.primaryName ||
      company.primaryEmail ||
      company.primaryPhone ||
      t('unknown'),
    avatar: company.avatar,
  }));
  const departmentItems = (departments || []).map((department) => ({
    _id: department._id,
    name: department.title || t('unknown'),
  }));
  const branchItems = (branches || []).map((branch) => ({
    _id: branch._id,
    name: branch.title || t('unknown'),
  }));
  const customPropertyItems = Array.isArray(customProperties)
    ? customProperties
        .map((property, index) => normalizeCustomProperty(property, index))
        .filter((item): item is DealCardDetailItem => Boolean(item))
    : [];

  if (
    !hasProducts &&
    !branches?.length &&
    !companies?.length &&
    !customers?.length &&
    !departments?.length &&
    !tags?.length &&
    !customPropertyItems.length &&
    !cardPropertyItems.length
  ) {
    return null;
  }

  return (
    <div className="flex flex-col gap-1 p-3 pt-0">
      <DealCardProducts
        items={dealProducts}
        label={t('products')}
        totalLabel={t('total')}
      />
      <DealCardProducts
        items={excludedProducts}
        label={t('exclude-products')}
        totalLabel={t('total')}
        muted
      />
      <DealCardRelationDetails items={customerItems} type="customer" />
      <DealCardRelationDetails items={companyItems} type="company" />
      <DealCardRelationDetails items={departmentItems} type="department" />
      <DealCardRelationDetails items={branchItems} type="branch" />
      {Boolean(
        tags?.length || customPropertyItems.length || cardPropertyItems.length,
      ) && (
        <div className="mt-1 flex flex-col gap-1">
          <DealCardDetails items={tags || []} color="#FF6600" />
          <DealCardDetails items={customPropertyItems} color="#FF9900" />
          <DealCardDetails items={cardPropertyItems} color="#0EA5E9" />
        </div>
      )}
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
            <Labels labels={labels} type="toggle" />
          </div>
        )}
        <div className="flex flex-col gap-1">
          <h5 className="font-semibold">
            <CopyText value={name || ''} className="hover:opacity-70 text-left">
              {name}
            </CopyText>
          </h5>
          {stage?.age !== undefined && stage.age < 0 && (
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
            initialValue={labels?.map((label) => label._id || '') || []}
            showLabels
          />
          <SelectTagsFilterBar
            filterKey=""
            mode="multiple"
            label={t('by-tag')}
            variant="card"
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
          <SelectCustomerFilterBar
            filterKey=""
            mode="multiple"
            variant="card"
            initialValue={
              currentCustomers?.map((customer) => customer._id || '') || []
            }
            value={
              currentCustomers?.map((customer) => customer._id || '') || []
            }
            onValueChange={(value?: string | string[]) => {
              const selectedIds = normalizeSelectedIds(value);

              if (!selectedIds.length) return;

              const updatedCustomers = selectedIds.map(
                (id: string) =>
                  currentCustomers?.find((c) => c._id === id) || { _id: id },
              );
              setCurrentCustomers(updatedCustomers);

              manageRelations({
                contentType: 'sales:deal',
                contentId: _id,
                relatedContentType: 'core:customer',
                relatedContentIds: selectedIds,
              });
            }}
            hideAvatar
          />
          <SelectCompanyFilterBar
            filterKey=""
            mode="multiple"
            label={t('by-company')}
            variant="card"
            targetId={_id}
            initialValue={
              currentCompanies?.map((company) => company._id || '') || []
            }
            value={currentCompanies?.map((company) => company._id || '') || []}
            onValueChange={(value?: string | string[]) => {
              const selectedIds = normalizeSelectedIds(value);

              if (!selectedIds.length) return;

              const updatedCompanies = selectedIds.map(
                (id: string) =>
                  currentCompanies?.find((c) => c._id === id) || { _id: id },
              );
              setCurrentCompanies(updatedCompanies);

              manageRelations({
                contentType: 'sales:deal',
                contentId: _id,
                relatedContentType: 'core:company',
                relatedContentIds: selectedIds,
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
            {t('archived')}
          </span>
        </div>
      )}
    </div>
  );
});
