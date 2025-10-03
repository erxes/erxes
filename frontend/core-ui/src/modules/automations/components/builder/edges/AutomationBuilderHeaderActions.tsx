import {
  automationBuilderActiveTabState,
  automationBuilderPanelOpenState,
  automationBuilderSiderbarOpenState,
  toggleAutomationBuilderOpenPanel,
  toggleAutomationBuilderOpenSidebar,
} from '@/automations/states/automationState';
import { TAutomationBuilderForm } from '@/automations/utils/AutomationFormDefinitions';
import { Button, Command, Form, Label, Switch } from 'erxes-ui';
import { useAtomValue, useSetAtom } from 'jotai';
import { useMemo } from 'react';
import { useFormContext } from 'react-hook-form';

export const AutomationBuilderHeaderActions = () => {
  const { control } = useFormContext<TAutomationBuilderForm>();
  const isOpenSideBar = useAtomValue(automationBuilderSiderbarOpenState);
  const toggleSideBarOpen = useSetAtom(toggleAutomationBuilderOpenSidebar);

  const isPanelOpen = useAtomValue(automationBuilderPanelOpenState);
  const togglePanelOpen = useSetAtom(toggleAutomationBuilderOpenPanel);
  const activeTab = useAtomValue(automationBuilderActiveTabState);
  const isMac = useMemo(
    () => /Mac|iPod|iPhone|iPad/.test(navigator.platform),
    [],
  );

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

      <Button variant="secondary" onClick={togglePanelOpen}>
        {`${isPanelOpen ? 'Hide Inspect' : 'Show Inspect'}`}
        <Command.Shortcut>{isMac ? '⌘' : 'Ctrl'}I</Command.Shortcut>
      </Button>

      <Button variant="secondary" onClick={toggleSideBarOpen}>
        {`${isOpenSideBar ? 'Hide Menu' : 'Show Menu'}`}
        <Command.Shortcut>{isMac ? '⌘' : 'Ctrl'}G</Command.Shortcut>
      </Button>
    </div>
  );
};
