import { automationBuilderActiveTabState } from '@/automations/states/automationState';
import { TAutomationBuilderForm } from '@/automations/utils/automationFormDefinitions';
import { Form, Label, Switch } from 'erxes-ui';
import { useAtomValue } from 'jotai';
import { useFormContext } from 'react-hook-form';

export const AutomationBuilderHeaderActions = () => {
  const { control } = useFormContext<TAutomationBuilderForm>();
  const activeTab = useAtomValue(automationBuilderActiveTabState);

  if (activeTab !== 'builder') {
    return null;
  }

  return (
    <div className="flex flex-row justify-between items-center gap-4">
      <Form.Field
        control={control}
        name="status"
        render={({ field }) => (
          <Form.Item>
            <Form.Control>
              <div className="flex items-center space-x-2">
                <Label htmlFor="mode">Inactive</Label>
                <Switch
                  id="mode"
                  onCheckedChange={(open) =>
                    field.onChange(open ? 'active' : 'draft')
                  }
                  checked={field.value === 'active'}
                />
              </div>
            </Form.Control>
          </Form.Item>
        )}
      />
    </div>
  );
};
