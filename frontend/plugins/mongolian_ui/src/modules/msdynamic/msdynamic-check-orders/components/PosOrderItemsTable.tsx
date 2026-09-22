import { IOrderItem } from '../types/msDynamicCheckOrder';
import { formatAmount } from './PosOrderDetailLayout';
import { useTranslation } from 'react-i18next';

/** Items table header gargana. */
const PosOrderItemsTableHeader = () => {
  const { t } = useTranslation('mongolian');
  return (
    <thead>
      <tr className="border-b border-border/70 bg-muted/20 text-xs text-muted-foreground">
        <th className="px-4 py-3 text-left font-medium">{t('product')}</th>
        <th className="w-20 px-4 py-3 text-right font-medium">{t('qty')}</th>
        <th className="w-32 px-4 py-3 text-right font-medium">{t('unit-price')}</th>
        <th className="w-32 px-4 py-3 text-right font-medium">{t('amount')}</th>
        <th className="w-28 px-4 py-3 text-right font-medium">{t('discount')}</th>
      </tr>
    </thead>
  );
};

/** Neg item row-iig gargana. */
const PosOrderItemRow = ({ item }: { item: IOrderItem }) => (
  <tr className="border-b border-border/50 transition-colors last:border-b-0 hover:bg-muted/20">
    <td className="px-4 py-3 font-medium text-foreground/90">
      {item.productName || '-'}
    </td>
    <td className="px-4 py-3 text-right tabular-nums">{item.count || 0}</td>
    <td className="px-4 py-3 text-right tabular-nums">
      {formatAmount(item.unitPrice)}
    </td>
    <td className="px-4 py-3 text-right font-medium tabular-nums">
      {formatAmount((item.count || 0) * (item.unitPrice || 0))}
    </td>
    <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">
      {formatAmount(item.discountAmount)}
    </td>
  </tr>
);

/** Items baihgui ued empty row gargana. */
const PosOrderItemsEmptyRow = () => {
  const { t } = useTranslation('mongolian');
  return (
    <tr>
      <td className="px-4 py-10 text-center text-muted-foreground" colSpan={5}>
        {t('no-items')}
      </td>
    </tr>
  );
};

/** Items table body gargana. */
const PosOrderItemsTableBody = ({ items }: { items: IOrderItem[] }) => (
  <tbody>
    {items.length ? (
      items.map((item: IOrderItem) => (
        <PosOrderItemRow key={item._id} item={item} />
      ))
    ) : (
      <PosOrderItemsEmptyRow />
    )}
  </tbody>
);

/** Product rows table deer gargana. */
export const PosOrderItemsTable = ({ items }: { items: IOrderItem[] }) => (
  <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-md border border-border/70">
    <div className="min-h-0 flex-1 overflow-auto">
      <table className="w-full min-w-[620px] text-sm">
        <PosOrderItemsTableHeader />
        <PosOrderItemsTableBody items={items} />
      </table>
    </div>
  </div>
);
