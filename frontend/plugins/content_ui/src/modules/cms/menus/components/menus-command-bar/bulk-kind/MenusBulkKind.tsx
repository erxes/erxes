import { Button, DropdownMenu, RecordTable, toast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { useMutation } from '@apollo/client';
import { CMS_MENU_EDIT } from '@/cms/graphql/queries';
import {
  getErrorMessage,
  getRecordTableSelectedIds,
} from '@/cms/shared/utils';

const MENU_KINDS = [
  { value: 'header', labelKey: 'header' },
  { value: 'footer', labelKey: 'footer' },
];

export const MenusBulkKind = () => {
  const { t } = useTranslation('content');
  const { table } = RecordTable.useRecordTable();
  const selectedIds = getRecordTableSelectedIds(
    table.getFilteredSelectedRowModel().rows,
  );

  const [editMenu, { loading }] = useMutation(CMS_MENU_EDIT);

  const handleApply = async (kind: string) => {
    try {
      const results = await Promise.allSettled(
        selectedIds.map((_id) => editMenu({ variables: { _id, input: { kind } } })),
      );
      const rejected = results.filter(
        (r): r is PromiseRejectedResult => r.status === 'rejected',
      );
      if (rejected.length) throw rejected[0].reason;
      toast({ title: t('success'), variant: 'default' });
    } catch (error) {
      toast({
        title: t('error'),
        description: getErrorMessage(error),
        variant: 'destructive',
      });
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenu.Trigger asChild>
        <Button variant="secondary" size="sm" disabled={loading}>
          {t('kind')}
        </Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content sideOffset={15} align="end">
        {MENU_KINDS.map((k) => (
          <DropdownMenu.Item key={k.value} onSelect={() => handleApply(k.value)}>
            {t(k.labelKey)}
          </DropdownMenu.Item>
        ))}
      </DropdownMenu.Content>
    </DropdownMenu>
  );
};
