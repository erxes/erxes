import { IDeal } from '@/deals/types/deals';
import { dealProductsSchema, isRecord } from '@/deals/utils/dealJson';
import { isDefined } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import {
  CardDetailBadges,
  formatFieldValue,
  hasFieldValue,
  useFields,
  type CardDetailBadgeItem,
} from 'ui-modules';
import {
  DealCardProducts,
  DealCardRelationDetails,
} from './DealsBoardCardDetails';

const toNamedItems = <T extends { _id?: string | null }>(
  records: (T | null | undefined)[] | null | undefined,
  getName: (record: T) => string,
) =>
  (records || []).flatMap((record) =>
    record?._id ? [{ _id: record._id, name: getName(record) }] : [],
  );

const normalizeCustomProperty = (
  property: unknown,
  index: number,
): CardDetailBadgeItem | null => {
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

export const DealsBoardCardInfo = ({ deal }: { deal: IDeal }) => {
  const { t } = useTranslation('sales');
  const {
    branches,
    companies,
    customers,
    departments,
    tags,
    customProperties,
  } = deal;
  const propertiesData = isRecord(deal.propertiesData)
    ? deal.propertiesData
    : {};
  const parsedProducts = dealProductsSchema.safeParse(deal.productsData ?? []);
  const productsData = parsedProducts.success ? parsedProducts.data : [];
  const { fields: dealFields } = useFields({ contentType: 'sales:deal' });

  const cardPropertyItems = (dealFields || [])
    .filter(
      (field) =>
        field.isVisibleInCard && hasFieldValue(propertiesData[field._id]),
    )
    .map((field) => ({
      _id: field._id,
      name: `${field.name}: ${formatFieldValue(
        field,
        propertiesData[field._id],
      )}`,
    }));

  const productMap = new Map(
    deal.products?.filter(isDefined).map((product) => [product._id, product]),
  );

  const filterProducts = (tickUsed: boolean) => {
    return (
      productsData
        .filter((p) => p.tickUsed === tickUsed)
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
            currency: p.currency ?? undefined,
          };
        })
        .filter((p): p is NonNullable<typeof p> => Boolean(p)) || []
    );
  };

  const dealProducts = filterProducts(true);
  const excludedProducts = filterProducts(false);
  const hasProducts = dealProducts.length > 0 || excludedProducts.length > 0;
  const customerItems = toNamedItems(
    customers,
    (customer) =>
      [customer.firstName, customer.middleName, customer.lastName]
        .filter(Boolean)
        .join(' ') ||
      customer.primaryEmail ||
      customer.primaryPhone ||
      t('unknown'),
  );
  const companyItems = toNamedItems(
    companies,
    (company) =>
      company.primaryName ||
      company.primaryEmail ||
      company.primaryPhone ||
      t('unknown'),
  );
  const departmentItems = toNamedItems(
    departments,
    (department) => department.title || t('unknown'),
  );
  const branchItems = toNamedItems(
    branches,
    (branch) => branch.title || t('unknown'),
  );
  const customPropertyItems = Array.isArray(customProperties)
    ? customProperties
        .map((property, index) => normalizeCustomProperty(property, index))
        .filter((item): item is CardDetailBadgeItem => Boolean(item))
    : [];

  if (
    parsedProducts.success &&
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
      {!parsedProducts.success && (
        <span role="alert" className="text-destructive">
          {t('invalid-product-data', 'Unable to read product data')}
        </span>
      )}
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
          <CardDetailBadges
            items={
              tags?.filter(isDefined).map((tag) => ({
                ...tag,
                _id: tag._id ?? undefined,
                name: tag.name ?? '',
                colorCode: tag.colorCode ?? undefined,
              })) || []
            }
            color="#FF6600"
            maxVisibleItems={5}
          />
          <CardDetailBadges
            items={customPropertyItems}
            color="#FF9900"
            maxVisibleItems={5}
          />
          <CardDetailBadges
            items={cardPropertyItems}
            color="#0EA5E9"
            maxVisibleItems={5}
          />
        </div>
      )}
    </div>
  );
};
