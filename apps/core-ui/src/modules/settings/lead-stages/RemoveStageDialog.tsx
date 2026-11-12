import type { LeadStage } from '@erxes/core-contract';
import { Button, Dialog, Select, Spinner } from 'erxes-ui';
import { useState } from 'react';
import { useLeadsT, useStageName } from '~/modules/leads/i18n';
import { useLeadStageMutations } from '~/modules/leads/useLeads';

/** Mounted per stage, so the suggested destination starts fresh. */
const RemoveStageForm = ({
  stage,
  stages,
  onClose,
}: {
  stage: LeadStage;
  stages: LeadStage[];
  onClose: () => void;
}) => {
  const t = useLeadsT();
  const stageName = useStageName();
  const { remove } = useLeadStageMutations();
  const others = stages.filter((item) => item.id !== stage.id);
  const inUse = stage.leadCount + stage.companyLeadCount;
  const [moveTo, setMoveTo] = useState(
    () => others.find((item) => item.kind === stage.kind)?.id ?? others[0]?.id ?? '',
  );

  return (
    <>
      <Dialog.Header>
        <Dialog.Title>{t('settings.delete-title', { name: stageName(stage.name) })}</Dialog.Title>
        <Dialog.Description>
          {inUse ? t('settings.delete-in-use', { count: inUse }) : t('settings.delete-empty')}
        </Dialog.Description>
      </Dialog.Header>
      {inUse > 0 && (
        <Select value={moveTo} onValueChange={setMoveTo}>
          <Select.Trigger aria-label={t('settings.move-to')}>
            <Select.Value placeholder={t('settings.move-to')} />
          </Select.Trigger>
          <Select.Content>
            {others.map((item) => (
              <Select.Item key={item.id} value={item.id}>
                {stageName(item.name)}
              </Select.Item>
            ))}
          </Select.Content>
        </Select>
      )}
      <Dialog.Footer>
        <Button variant="outline" onClick={onClose}>
          {t('settings.cancel')}
        </Button>
        <Button
          variant="destructive"
          disabled={remove.isPending}
          onClick={() =>
            remove.mutate(
              { id: stage.id, moveTo: inUse ? moveTo : undefined },
              { onSuccess: onClose },
            )
          }
        >
          {remove.isPending && <Spinner size="sm" />}
          {t('settings.confirm')}
        </Button>
      </Dialog.Footer>
    </>
  );
};

/** Deleting a stage with leads in it: choose where they go. */
export const RemoveStageDialog = ({
  stage,
  stages,
  onClose,
}: {
  stage: LeadStage | null;
  stages: LeadStage[];
  onClose: () => void;
}) => (
  <Dialog open={Boolean(stage)} onOpenChange={(open) => !open && onClose()}>
    <Dialog.Content className="max-w-md">
      {stage && <RemoveStageForm key={stage.id} stage={stage} stages={stages} onClose={onClose} />}
    </Dialog.Content>
  </Dialog>
);
