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
    getValues,
    t,
    isActivating,
    control,
    isCreatePage,
    pendingStatus,
    setPendingStatus,
    handleConfirm,
    isUntouchedDuplicate,
    duplicatedFromName,
  } = useAutomationBuilderStatusSwitcher({ onSave, onError });

  if (isCreatePage) {
    return null;
  }

  const isActivatingDuplicate = isActivating && isUntouchedDuplicate;

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
                        onClick={() => {
                          const nextStatus = isActive ? 'draft' : 'active';

                          if (nextStatus !== getValues('status')) {
                            setPendingStatus(nextStatus);
                          }
                        }}
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
                      {isActivatingDuplicate
                        ? 'Activate an unchanged duplicate?'
                        : isActivating
                        ? 'Activate this automation?'
                        : 'Deactivate this automation?'}
                    </AlertDialog.Title>
                    <AlertDialog.Description>
                      {isActivatingDuplicate
                        ? `Nothing has changed since this was duplicated${
                            duplicatedFromName
                              ? ` from “${duplicatedFromName}”`
                              : ''
                          }. Activating it will run the same flow a second time on the same triggers.`
                        : isActivating
                        ? 'This will save your latest changes and start running this automation.'
                        : 'This will save your latest changes and stop this automation from running.'}
                    </AlertDialog.Description>
                  </AlertDialog.Header>
                  <AlertDialog.Footer>
                    <AlertDialog.Cancel>{t('cancel')}</AlertDialog.Cancel>
                    <AlertDialog.Action onClick={handleConfirm}>
                      {isActivatingDuplicate
                        ? 'Activate anyway'
                        : isActivating
                        ? 'Save and activate'
                        : 'Save and deactivate'}
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
