import { useAutomationBuilderStatusSwitcher } from '@/automations/hooks/useAutomationBuilderStatusSwitcher';
import { TAutomationBuilderForm } from '@/automations/utils/automationFormDefinitions';
import { AlertDialog, Form, Label, Switch } from 'erxes-ui';
import { SubmitErrorHandler } from 'react-hook-form';

type AutomationBuilderStatusSwitchProps = {
  disabled?: boolean;
  onSave: (values: TAutomationBuilderForm) => Promise<unknown>;
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
  } = useAutomationBuilderStatusSwitcher({ onSave, onError });

  if (isCreatePage) {
    return null;
  }

  return (
    <Form.Field
      control={control}
      name="status"
      render={({ field }) => (
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
              <div className="flex shrink-0 items-center gap-2">
                <Label htmlFor="mode" className="whitespace-nowrap">
                  {field.value === 'active' ? t('active') : t('inactive')}
                </Label>
                <Switch
                  id="mode"
                  disabled={disabled}
                  onCheckedChange={(open) => {
                    const nextStatus = open ? 'active' : 'draft';

                    if (nextStatus !== getValues('status')) {
                      setPendingStatus(nextStatus);
                    }
                  }}
                  checked={field.value === 'active'}
                />
              </div>
              <AlertDialog.Content>
                <AlertDialog.Header>
                  <AlertDialog.Title>
                    {isActivating
                      ? 'Activate this automation?'
                      : 'Deactivate this automation?'}
                  </AlertDialog.Title>
                  <AlertDialog.Description>
                    {isActivating
                      ? 'This will save your latest changes and start running this automation.'
                      : 'This will save your latest changes and stop this automation from running.'}
                  </AlertDialog.Description>
                </AlertDialog.Header>
                <AlertDialog.Footer>
                  <AlertDialog.Cancel>{t('cancel')}</AlertDialog.Cancel>
                  <AlertDialog.Action onClick={handleConfirm}>
                    {isActivating ? 'Save and activate' : 'Save and deactivate'}
                  </AlertDialog.Action>
                </AlertDialog.Footer>
              </AlertDialog.Content>
            </AlertDialog>
          </Form.Control>
        </Form.Item>
      )}
    />
  );
};
