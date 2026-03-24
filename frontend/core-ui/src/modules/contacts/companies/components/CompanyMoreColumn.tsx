import { Cell } from '@tanstack/react-table';
import { RecordTable } from 'erxes-ui';

import { Popover, Command, Combobox } from 'erxes-ui';
import { IconEdit } from '@tabler/icons-react';
import { TCompany } from '@/contacts/types/companyType';
import { useSearchParams } from 'react-router-dom';

export const CompanyMoreColumnCell = ({
  cell,
}: {
  cell: Cell<TCompany, unknown>;
}) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { _id } = cell.row.original;

  const setOpen = (companyId: string) => {
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set('companyId', companyId);
    setSearchParams(newSearchParams);
  };

  return (
    <Popover>
      <Popover.Trigger asChild>
        <RecordTable.MoreButton className="w-full h-full" />
      </Popover.Trigger>
      <Combobox.Content>
        <Command shouldFilter={false}>
          <Command.List>
            <Command.Item value="edit" onSelect={() => setOpen(_id)}>
              <IconEdit /> Edit
            </Command.Item>
          </Command.List>
        </Command>
      </Combobox.Content>
    </Popover>
  );
};

export const companyMoreColumn = {
  id: 'more',
  cell: CompanyMoreColumnCell,
  size: 33,
};
