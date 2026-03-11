import { automationBuilderActiveTabState } from '@/automations/states/automationState';
import { TAutomationBuilderForm } from '@/automations/utils/automationFormDefinitions';
import { Button, Form, Label, Switch, Toggle } from 'erxes-ui';
import { useAtomValue } from 'jotai';
import { useFormContext } from 'react-hook-form';
import { useAutomationNodeLibrarySidebar } from '@/automations/components/builder/sidebar/hooks/useAutomationNodeLibrarySidebar';
import { useAutomationBuilderSidebarHooks } from '@/automations/components/builder/sidebar/hooks/useAutomationBuilderSidebarHooks';
import { AUTOMATION_LIBRARY_TABS } from '@/automations/constants';
import { IconBolt } from '@tabler/icons-react';

export const AutomationBuilderHeaderActions = () => {
  const { control } = useFormContext<TAutomationBuilderForm>();
  const activeTab = useAtomValue(automationBuilderActiveTabState);
  const { setQueryParams, activeNodeTab } = useAutomationNodeLibrarySidebar();
  const { setIsOpenSideBar, handleClose } = useAutomationBuilderSidebarHooks();
  if (activeTab !== 'builder') {
    return null;
  }

  return (
    <div className="flex items-center gap-9">
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
      <div className="flex items-center gap-2">
        {AUTOMATION_LIBRARY_TABS.map(({ value, label }) => (
          <Toggle
            key={value}
            variant="outline"
            className="data-[state=on]:shadow-focus data-[state=on]:bg-background bg-background text-foreground"
            pressed={value === activeNodeTab}
            asChild
            onPressedChange={() => {
              if (value === activeNodeTab) {
                handleClose();
              } else {
                setQueryParams({ activeNodeTab: value });
                setIsOpenSideBar(true);
              }
            }}
          >
            <Button variant="outline">
              <IconBolt></IconBolt>
              {label}
            </Button>
          </Toggle>
        ))}
      </div>
    </div>
  );
};
