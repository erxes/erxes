import { IconTrash } from '@tabler/icons-react';
import { Row } from '@tanstack/table-core';
import { Button } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { Can } from 'ui-modules';
import { useBroadcastDeleteSelected } from '../../hooks/useBroadcastDeleteSelected';

export const BroadcastDelete = ({ rows }: { rows: Row<{ _id: string }>[] }) => {
  const { t } = useTranslation('broadcasts');
  const { deleteSelected } = useBroadcastDeleteSelected(rows);

  return (
    <Can action="broadcastDelete">
      <Button
        variant="secondary"
        className="text-destructive"
        onClick={deleteSelected}
      >
        <IconTrash />
        {t('actions.delete')}
      </Button>
    </Can>
  );
};
