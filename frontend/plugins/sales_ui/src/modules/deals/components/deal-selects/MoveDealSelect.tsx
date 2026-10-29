import { RecordTableInlineCell } from 'erxes-ui';
import { useSidePanel } from 'ui-modules';

import { IDeal } from '@/deals/types/deals';
import { useTranslation } from 'react-i18next';

export const NameCell = ({ deal }: { deal: IDeal }) => {
  const { t } = useTranslation('sales');
  const { openRecord } = useSidePanel();

  const handleClick = () => {
    openRecord({ contentType: 'sales:deal', contentId: deal._id });
  };

  return (
    <RecordTableInlineCell onClick={handleClick}>
      <div className="flex items-center justify-between w-full gap-2">
        <span>{deal.name}</span>
        {deal.status === 'archived' && (
          <span className="shrink-0 px-2 py-0.5 text-xs font-medium bg-amber-100/80 text-amber-900 border border-amber-200/50 rounded-sm">
            {t('archived')}
          </span>
        )}
      </div>
    </RecordTableInlineCell>
  );
};

export const NumberCell = ({ deal }: { deal: IDeal }) => {
  const { t } = useTranslation('sales');
  const { openRecord } = useSidePanel();

  const handleClick = () => {
    openRecord({ contentType: 'sales:deal', contentId: deal._id });
  };

  return (
    <RecordTableInlineCell onClick={handleClick}>
      <div className="flex items-center justify-between w-full gap-2">
        <span>{deal.number ?? '-'}</span>
        {deal.status === 'archived' && (
          <span className="shrink-0 px-2 py-0.5 text-xs font-medium bg-amber-100/80 text-amber-900 border border-amber-200/50 rounded-sm">
            {t('archived')}
          </span>
        )}
      </div>
    </RecordTableInlineCell>
  );
};

export const ProductsCell = ({ deal }: { deal: IDeal }) => {
  return (
    <RecordTableInlineCell>
      <div className="flex items-center justify-between w-full gap-2">
        <span>{deal.products?.length}</span>
      </div>
    </RecordTableInlineCell>
  );
};
