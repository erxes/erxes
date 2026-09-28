import { RecordTableInlineCell } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { BrandsInline } from 'ui-modules';

export const BroadcastBrandCell = ({ brandId }: { brandId?: string }) => {
  const { t } = useTranslation('broadcasts');

  return (
    <RecordTableInlineCell>
      <BrandsInline
        brandIds={brandId ? [brandId] : []}
        placeholder={t('columns.no-brand')}
      />
    </RecordTableInlineCell>
  );
};
