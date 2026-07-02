import { IconEye, IconEdit, IconDotsVertical } from '@tabler/icons-react';
import { Button, DropdownMenu } from 'erxes-ui';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export const VendorsMoreColumn = ({
  cell,
  onEdit,
}: {
  cell: any;
  onEdit?: (vendor: any) => void;
}) => {
  const { t } = useTranslation('insurance');
  const vendor = cell.row.original;

  return (
    <DropdownMenu>
      <DropdownMenu.Trigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <IconDotsVertical size={16} />
        </Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content align="start">
        <DropdownMenu.Item asChild>
          <Link to={`/insurance/vendors/${vendor.id}`}>
            <IconEye size={16} />
            {t('view-details')}
          </Link>
        </DropdownMenu.Item>
        {onEdit && (
          <DropdownMenu.Item onClick={() => onEdit(vendor)}>
            <IconEdit size={16} />
            {t('edit')}
          </DropdownMenu.Item>
        )}
      </DropdownMenu.Content>
    </DropdownMenu>
  );
};
