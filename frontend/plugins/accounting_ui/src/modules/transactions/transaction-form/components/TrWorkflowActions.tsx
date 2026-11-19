import { IconDots } from '@tabler/icons-react';
import { Button, Dialog, DropdownMenu, useConfirm } from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SelectMember } from 'ui-modules';
import {
  getTrWorkflowActions,
  TTrWorkflowAction,
  TTrWorkflowFields,
} from '../utils/statusWorkflow';

type TSavedWorkflowState = {
  status?: string;
  mentionOwnerId?: string;
  mentionUserIds?: string[];
};

export const TrWorkflowActions = ({
  currentUserId,
  saved,
  disabled,
  onAction,
}: {
  currentUserId?: string;
  saved: TSavedWorkflowState;
  disabled?: boolean;
  onAction: (fields: TTrWorkflowFields) => void;
}) => {
  const { t } = useTranslation('accounting');
  const { confirm } = useConfirm();
  const [approverAction, setApproverAction] = useState<TTrWorkflowAction>();
  const [approverIds, setApproverIds] = useState<string[]>([]);

  const { primary, more } = getTrWorkflowActions({ currentUserId, ...saved });

  const run = (action: TTrWorkflowAction) => {
    if (action.needsApprovers) {
      setApproverIds([]);
      setApproverAction(action);
      return;
    }

    if (action.confirmMessage) {
      confirm({
        message: t(action.confirmMessage),
        options: { okLabel: t(action.label), cancelLabel: t('cancel-label') },
      }).then(() => onAction(action.getFields()));
      return;
    }

    onAction(action.getFields());
  };

  const submitApprovers = () => {
    if (!approverAction || !approverIds.length) {
      return;
    }

    onAction(approverAction.getFields(approverIds));
    setApproverAction(undefined);
  };

  if (!primary.length && !more.length) {
    return null;
  }

  return (
    <>
      {primary.map((action) => (
        <Button
          key={action.key}
          type="button"
          variant={action.destructive ? 'secondary' : 'default'}
          className={action.destructive ? 'text-destructive' : undefined}
          disabled={disabled}
          onClick={() => run(action)}
        >
          {t(action.label)}
        </Button>
      ))}
      {more.length > 0 && (
        <DropdownMenu>
          <DropdownMenu.Trigger asChild>
            <Button
              type="button"
              variant="secondary"
              size="icon"
              disabled={disabled}
              title={t('more-actions')}
            >
              <IconDots />
            </Button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Content align="end" className="min-w-48">
            {more.map((action) => (
              <DropdownMenu.Item
                key={action.key}
                onClick={() => run(action)}
                className={
                  action.destructive
                    ? 'text-destructive focus:text-destructive'
                    : undefined
                }
              >
                {t(action.label)}
              </DropdownMenu.Item>
            ))}
          </DropdownMenu.Content>
        </DropdownMenu>
      )}
      <Dialog
        open={!!approverAction}
        onOpenChange={(open) => !open && setApproverAction(undefined)}
      >
        <Dialog.Content>
          <Dialog.Header>
            <Dialog.Title>{t(approverAction?.label || '')}</Dialog.Title>
            <Dialog.Description>
              {t('select-approvers-description')}
            </Dialog.Description>
          </Dialog.Header>
          <SelectMember
            mode="multiple"
            value={approverIds}
            onValueChange={(value) =>
              setApproverIds(
                Array.isArray(value) ? value : value ? [value] : [],
              )
            }
            placeholder={t('select-approvers')}
          />
          <Dialog.Footer className="mt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setApproverAction(undefined)}
            >
              {t('cancel-label')}
            </Button>
            <Button
              type="button"
              disabled={!approverIds.length || disabled}
              onClick={submitApprovers}
            >
              {t('send-request')}
            </Button>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog>
    </>
  );
};
