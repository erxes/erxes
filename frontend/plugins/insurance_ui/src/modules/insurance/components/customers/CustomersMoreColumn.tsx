import { IconEye, IconEdit, IconDotsVertical } from '@tabler/icons-react';
import { Button, DropdownMenu } from 'erxes-ui';
import { Link } from 'react-router-dom';

export const CustomersMoreColumn = ({ cell }: { cell: any }) => {
  const customerId = cell.row.original.id;

  return (
    <DropdownMenu>
      <DropdownMenu.Trigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <IconDotsVertical size={16} />
        </Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content align="start">
        <DropdownMenu.Item asChild>
          <Link to={`/insurance/customers/${customerId}`}>
            <IconEye size={16} />
            Дэлгэрэнгүй
          </Link>
        </DropdownMenu.Item>
        <DropdownMenu.Item asChild>
          <Link to={`/insurance/customers/${customerId}/edit`}>
            <IconEdit size={16} />
            Засах
          </Link>
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu>
  );
};
