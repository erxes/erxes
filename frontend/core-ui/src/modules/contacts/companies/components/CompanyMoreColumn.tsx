import { TCompany } from '@/contacts/types/companyType';
import { IconEdit } from '@tabler/icons-react';
import { Cell } from '@tanstack/react-table';
import { Combobox, Command, Popover, RecordTable } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { Can, useSidePanel } from 'ui-modules';

export const CompanyMoreColumnCell = ({
  cell,
}: {
  cell: Cell<TCompany, unknown>;
}) => {
  const { t } = useTranslation('contact', { keyPrefix: 'company' });
  const { openRecord } = useSidePanel();
  const { _id } = cell.row.original;

  return (
    <Popover>
      <Can action="contactsUpdate">
        <Popover.Trigger asChild>
          <RecordTable.MoreButton className="w-full h-full" />
        </Popover.Trigger>
      </Can>
      <Combobox.Content>
        <Command shouldFilter={false}>
          <Command.List>
            <Command.Item
              value="edit"
              onSelect={() =>
                openRecord({ contentType: 'core:company', contentId: _id })
              }
            >
              <IconEdit /> {t('action-edit')}
            </Command.Item>
          </Command.List>
        </Command>
      </Combobox.Content>
    </Popover>
  );
};

export const companyMoreColumn = {
  id: 'more',
  header: () => <RecordTable.ColumnSelector />,
  cell: CompanyMoreColumnCell,
  size: 33,
};
