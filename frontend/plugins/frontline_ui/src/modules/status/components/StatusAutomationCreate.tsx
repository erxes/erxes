import { IconAffiliate } from '@tabler/icons-react';
import { Button, Dialog, Spinner } from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { TicketStatusChecklist } from '@/status/components/TicketStatusChecklist';
import { useCreateStatusAutomation } from '@/status/hooks/useCreateStatusAutomation';

export const StatusAutomationCreate = () => {
  const { t } = useTranslation('frontline');
  const [open, setOpen] = useState(false);
  const { pipelineId, statusIds, setStatusIds, create, loading } =
    useCreateStatusAutomation(open);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <Button variant="outline">
          <IconAffiliate />
          {t('status-automation-create', 'Create automation')}
        </Button>
      </Dialog.Trigger>
      <Dialog.Content className="max-w-md">
        <Dialog.Header>
          <Dialog.Title>
            {t('status-automation-create', 'Create automation')}
          </Dialog.Title>
          <Dialog.Description>
            {t(
              'status-automation-create-description',
              'Starts when a ticket moves to one of these statuses, with one branch per status. Add the actions in the builder.',
            )}
          </Dialog.Description>
        </Dialog.Header>
        <TicketStatusChecklist
          pipelineId={pipelineId}
          value={statusIds}
          onChange={setStatusIds}
        />
        <Dialog.Footer>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={loading}
          >
            {t('cancel', 'Cancel')}
          </Button>
          <Button onClick={create} disabled={!statusIds.length || loading}>
            {loading && <Spinner size="sm" />}
            {t('status-automation-create-submit', 'Create and open')}
          </Button>
        </Dialog.Footer>
      </Dialog.Content>
    </Dialog>
  );
};
