import { IconX } from '@tabler/icons-react';
import { Button } from 'erxes-ui';
import { useUserInviteContext } from '../../hooks/useUserInviteContext';
import { useTranslation } from 'react-i18next';
export const InviteRowRemoveButton = ({
  remove,
}: {
  remove: (index: number | number[]) => void;
}) => {
  const { selectedUsers, setSelectedUsers, fields } = useUserInviteContext();
  const { t } = useTranslation('settings', { keyPrefix: 'team-member' });

  if (selectedUsers.length === 0) return null;

  const handleRemove = () => {
    remove(
      selectedUsers.map((id) =>
        fields.findIndex((product) => product.id === id),
      ),
    );
    setSelectedUsers([]);
  };

  return (
    <Button
      variant="secondary"
      className="bg-destructive/10 text-destructive"
      onClick={handleRemove}
    >
      <IconX />
      {t('remove-selected', 'Remove Selected')}
    </Button>
  );
};
