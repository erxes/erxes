import { IconTrash } from '@tabler/icons-react';
import { Button, Spinner } from 'erxes-ui';
import { IAutomation } from '@/automations/types';
import { Row } from '@tanstack/table-core';
import { useAutomationRemoveSelected } from '@/automations/hooks/useAutomationRemoveSelected';
import { useTranslation } from 'react-i18next';

export const AutomationRemoveButtonCommandBar = ({
  automationIds,
  rows,
}: {
  automationIds: string[];
  rows: Row<IAutomation>[];
}) => {
  const { t } = useTranslation('automations');
  const { removing, requestRemove } = useAutomationRemoveSelected(
    automationIds,
    rows,
  );

  return (
    <Button
      variant="secondary"
      className="text-destructive"
      disabled={removing}
      onClick={requestRemove}
    >
      {removing ? <Spinner /> : <IconTrash />}
      {t('delete')}
    </Button>
  );
};
