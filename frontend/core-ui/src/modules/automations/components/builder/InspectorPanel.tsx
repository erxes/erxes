import { AutomationBuilderCanvas } from '@/automations/components/builder/AutomationBuilderCanvas';
import {
  automationBuilderPanelOpenState,
  toggleAutomationBuilderOpenPanel,
} from '@/automations/states/automationState';
import { AutomationsHotKeyScope } from '@/automations/types';
import {
  PageSubHeader,
  Resizable,
  usePreviousHotkeyScope,
  useScopedHotkeys,
} from 'erxes-ui';
import { useAtomValue, useSetAtom } from 'jotai';

export const InspectorPanel = () => {
  const isPanelOpen = useAtomValue(automationBuilderPanelOpenState);
  const togglePanelOpen = useSetAtom(toggleAutomationBuilderOpenPanel);
  const { setHotkeyScopeAndMemorizePreviousScope } = usePreviousHotkeyScope();

  const onOpen = () => {
    togglePanelOpen();
    setHotkeyScopeAndMemorizePreviousScope(AutomationsHotKeyScope.Builder);
  };

  useScopedHotkeys(`mod+i`, () => onOpen(), AutomationsHotKeyScope.Builder);

  return (
    <Resizable.PanelGroup direction="vertical" className="w-full h-full">
      {/* Canvas */}
      <Resizable.Panel id="main-canvas" minSize={30} className="relative">
        <AutomationBuilderCanvas />
      </Resizable.Panel>

      {isPanelOpen && (
        <>
          <Resizable.Handle />

          <Resizable.Panel
            id="inspector-panel"
            defaultSize={30}
            minSize={5}
            className="bg-background"
          >
            <PageSubHeader>Inspect</PageSubHeader>
            <Resizable.PanelGroup direction="horizontal">
              <Resizable.Panel minSize={20} maxSize={50} defaultSize={30}>
                Executions
              </Resizable.Panel>
              <Resizable.Handle />
              <Resizable.Panel> Outputs</Resizable.Panel>
            </Resizable.PanelGroup>
          </Resizable.Panel>
        </>
      )}
    </Resizable.PanelGroup>
  );
};
