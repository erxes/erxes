import { IconEye, IconEdit, IconDotsVertical } from '@tabler/icons-react';
import { Button, DropdownMenu } from 'erxes-ui';
import { Link } from 'react-router-dom';

export const ContractMoreColumn = ({ cell }: { cell: any }) => {
  const contractId = cell.row.original.id;

  return (
    <DropdownMenu>
      <DropdownMenu.Trigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <IconDotsVertical size={16} />
        </Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content align="start">
        <DropdownMenu.Item asChild>
          <Link to={`/insurance/contracts/${contractId}`}>
            <IconEye size={16} />
            View Details
          </Link>
        </DropdownMenu.Item>
        <DropdownMenu.Item asChild>
          <Link to={`/insurance/contracts/${contractId}/pdf`}>
            <IconEdit size={16} />
            Edit PDF
          </Link>
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu>
  );
};
