import { CommandBar, RecordTable, Separator } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { DeleteCoupon } from './delete/DeleteCoupon';

export const CouponCommandBar = () => {
  const { t } = useTranslation('loyalty');
  const { table } = RecordTable.useRecordTable();

  return (
    <CommandBar open={table.getFilteredSelectedRowModel().rows.length > 0}>
      <CommandBar.Bar>
        <CommandBar.Value>
          {t('selected-count', { count: table.getFilteredSelectedRowModel().rows.length })}
        </CommandBar.Value>
        <Separator.Inline />
        <DeleteCoupon
          couponIds={table
            .getFilteredSelectedRowModel()
            .rows.map((row) => row.original._id)}
        />
      </CommandBar.Bar>
    </CommandBar>
  );
};
