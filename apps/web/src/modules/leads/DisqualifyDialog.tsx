import type { LeadRecordType } from '@erxes/core-contract';
import { IconCircleX } from '@tabler/icons-react';
import { Button, Dialog, Spinner, Textarea } from 'erxes-ui';
import { useState } from 'react';
import { useLeadsT, useStageName } from './i18n';
import { useLeadStages, useMoveLeads } from './useLeads';

/** Common reasons, one click away; anything else can be typed. */
const REASONS = ['budget', 'fit', 'response', 'competitor', 'timing', 'duplicate'] as const;

type DisqualifyProps = {
  recordType: LeadRecordType;
  ids: string[];
  onClose: () => void;
  onDone?: () => void;
};

/** Mounted per opening, so the reason starts empty each time. */
const DisqualifyForm = ({
  recordType,
  ids,
  stageId,
  onClose,
  onDone,
}: DisqualifyProps & { stageId: string }) => {
  const t = useLeadsT();
  const stageName = useStageName();
  const move = useMoveLeads();
  const { byId } = useLeadStages();
  const [reason, setReason] = useState('');

  const submit = () =>
    move.mutate(
      { recordType, ids, stageId, reason: reason.trim() || undefined },
      {
        onSuccess: () => {
          onClose();
          onDone?.();
        },
      },
    );

  return (
    <>
      <Dialog.Header>
        <Dialog.Title>
          {ids.length === 1
            ? t('actions.disqualify-one')
            : t('actions.disqualify-many', { count: ids.length })}
        </Dialog.Title>
        <Dialog.Description>
          {t('actions.disqualify-description', { stage: stageName(byId.get(stageId)?.name) })}
        </Dialog.Description>
      </Dialog.Header>
      <div className="flex flex-wrap gap-1.5">
        {REASONS.map((key) => {
          const item = t(`actions.reasons.${key}`);

          return (
            <Button
              key={key}
              size="sm"
              variant={reason === item ? 'default' : 'outline'}
              onClick={() => setReason(item)}
            >
              {item}
            </Button>
          );
        })}
      </div>
      <Textarea
        value={reason}
        onChange={(event) => setReason(event.target.value)}
        placeholder={t('actions.reason-placeholder')}
        aria-label={t('actions.reason-placeholder')}
        maxLength={500}
      />
      <Dialog.Footer>
        <Button variant="outline" onClick={onClose} disabled={move.isPending}>
          {t('actions.cancel')}
        </Button>
        <Button variant="destructive" onClick={submit} disabled={move.isPending}>
          {move.isPending ? <Spinner size="sm" /> : <IconCircleX />}
          {t('actions.disqualify')}
        </Button>
      </Dialog.Footer>
    </>
  );
};

/** Asks why, then moves the leads to the disqualified stage `stageId` (closed while it is null). */
export const DisqualifyDialog = ({
  stageId,
  ...props
}: DisqualifyProps & { stageId: string | null }) => (
  <Dialog open={Boolean(stageId)} onOpenChange={(open) => !open && props.onClose()}>
    <Dialog.Content className="max-w-md">
      {stageId && <DisqualifyForm key={stageId} stageId={stageId} {...props} />}
    </Dialog.Content>
  </Dialog>
);
