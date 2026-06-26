import { Button, DropdownMenu, RecordTable, toast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { useMutation } from '@apollo/client';
import { CMS_MENU_EDIT } from '@/cms/graphql/queries';

const MENU_KINDS = [
  { value: 'header', labelKey: 'header' },
  { value: 'footer', labelKey: 'footer' },
];

export const MenusBulkKind = () => {
  const { t } = useTranslation('content');
  const { table } = RecordTable.useRecordTable();
  const selectedRows = table.getFilteredSelectedRowModel().rows;
  const selectedIds = selectedRows.map((r: any) => r.original._id as string);

  const [editMenu, { loading }] = useMutation(CMS_MENU_EDIT);

  const handleApply = async (kind: string) => {
    try {
      await Promise.all(
        selectedIds.map((_id) => editMenu({ variables: { _id, input: { kind } } })),
      );
      toast({ title: t('success'), variant: 'default' });
    } catch (e: any) {
      toast({ title: t('error'), description: e.message, variant: 'destructive' });
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
