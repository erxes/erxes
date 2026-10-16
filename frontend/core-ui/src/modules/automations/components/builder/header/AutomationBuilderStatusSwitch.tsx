import { useAutomation } from '@/automations/context/AutomationProvider';
import { useAutomationNodes } from '@/automations/hooks/useAutomationNodes';
import { flowNeedsActor } from '@/automations/utils/automationBuilderUtils/actionActor';
import { useAutomationBuilderStatusSwitcher } from '@/automations/hooks/useAutomationBuilderStatusSwitcher';
import {
  TAutomationBuilderForm,
  TAutomationBuilderSaveValues,
} from '@/automations/utils/automationFormDefinitions';
import {
  IconPlayerPlayFilled,
  IconPlayerStopFilled,
  IconPower,
} from '@tabler/icons-react';
import { AlertDialog, Button, cn, Form, Tooltip } from 'erxes-ui';
import { SubmitErrorHandler } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

type AutomationBuilderStatusSwitchProps = {
  disabled?: boolean;
  onSave: (values: TAutomationBuilderSaveValues) => Promise<unknown>;
  onError: SubmitErrorHandler<TAutomationBuilderForm>;
};

export const AutomationBuilderStatusSwitch = ({
  disabled,
  onSave,
  onError,
}: AutomationBuilderStatusSwitchProps) => {
  const {
    t,
    isActivating,
    control,
    isCreatePage,
    pendingStatus,
    setPendingStatus,
    requestStatus,
    handleConfirm,
    isUntouchedDuplicate,
    duplicatedFromName,
  } = useAutomationBuilderStatusSwitcher({ onSave, onError });
  const { isReadOnly, detail, actionConstMap } = useAutomation();
  const { actions } = useAutomationNodes();
  const { t: translate } = useTranslation('automations');

  if (isCreatePage || isReadOnly) {
    return null;
  }

  // Putting it live is the moment ownership starts to mean something, so the
  // dialog says whose name the records will carry — and whether it is about
  // to become the reader's own. A flow that owns nothing stays quiet.
  const ownerName =
    detail?.ownerUser?.details?.fullName || detail?.ownerUser?.email;
  const takingOver = !detail?.ownerId;
  let ownershipLine: string | null = null;
  if (flowNeedsActor(actions, actionConstMap)) {
    ownershipLine = takingOver
      ? translate('activate-owner-taking')
      : translate('activate-owner-existing', { name: ownerName || '' });
  }

  const isActivatingDuplicate = isActivating && isUntouchedDuplicate;

  const pickDialogText = (
    duplicateText: string,
    activateText: string,
    deactivateText: string,
  ) => {
    if (isActivatingDuplicate) {
      return duplicateText;
    }
    return isActivating ? activateText : deactivateText;
  };

  const duplicateDescription = duplicatedFromName
    ? translate('header-activate-duplicate-description-from', {
        name: duplicatedFromName,
      })
    : translate('header-activate-duplicate-description');

  return (
    <Form.Field
      control={control}
      name="status"
      render={({ field }) => {
        const isActive = field.value === 'active';
        const actionLabel = isActive ? t('deactivate') : t('activate');

        return (
          <Form.Item>
            <Form.Control>
              <AlertDialog
                open={!!pendingStatus}
                onOpenChange={(open) => {
                  if (!open) {
                    setPendingStatus(null);
                  }
                }}
              >
                <Tooltip.Provider>
                  <Tooltip>
                    <Tooltip.Trigger asChild>
                      <Button
                        variant="outline"
                        size="icon"
                        disabled={disabled}
                        aria-label={actionLabel}
                        onClick={() =>
                          requestStatus(isActive ? 'draft' : 'active')
                        }
                        className={cn(
                          'shrink-0',
                          isActive
                            ? 'text-success hover:bg-destructive/10 hover:text-destructive'
                            : 'text-muted-foreground hover:bg-success/10 hover:text-success',
                        )}
                      >
                        {isActive ? <IconPower /> : <IconPlayerPlayFilled />}
                      </Button>
                    </Tooltip.Trigger>
                    <Tooltip.Content>{actionLabel}</Tooltip.Content>
                  </Tooltip>
                </Tooltip.Provider>
                <AlertDialog.Content>
                  <AlertDialog.Header>
                    <AlertDialog.Title>
                      {pickDialogText(
                        translate('header-activate-duplicate-title'),
                        translate('header-activate-title'),
                        translate('header-deactivate-title'),
                      )}
                    </AlertDialog.Title>
                    <AlertDialog.Description>
                      {pickDialogText(
                        duplicateDescription,
                        translate('header-activate-description'),
                        translate('header-deactivate-description'),
                      )}
                      {isActivating && ownershipLine && (
                        <span className="mt-2 block text-foreground">
                          {ownershipLine}
                        </span>
                      )}
                    </AlertDialog.Description>
                  </AlertDialog.Header>
                  <AlertDialog.Footer>
                    <AlertDialog.Cancel>{t('cancel')}</AlertDialog.Cancel>
                    <AlertDialog.Action onClick={handleConfirm}>
                      {pickDialogText(
                        translate('header-activate-anyway'),
                        translate('header-save-and-activate'),
                        translate('header-save-and-deactivate'),
                      )}
                    </AlertDialog.Action>
                  </AlertDialog.Footer>
                </AlertDialog.Content>
              </AlertDialog>
            </Form.Control>
          </Form.Item>
        );
      }}
    />
  );
};
