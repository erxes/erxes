import { IconEye, IconEdit, IconDotsVertical } from '@tabler/icons-react';
import { Button, DropdownMenu } from 'erxes-ui';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export const ContractMoreColumn = ({ cell }: { cell: any }) => {
  const { t } = useTranslation('insurance');
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
            {t('view-details')}
          </Link>
        </DropdownMenu.Item>
        <DropdownMenu.Item asChild>
          <Link to={`/insurance/contracts/${contractId}/pdf`}>
            <IconEdit size={16} />
            {t('edit-pdf')}
          </Link>
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu>
  );
};
