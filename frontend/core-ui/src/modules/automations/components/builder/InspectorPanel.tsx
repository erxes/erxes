import { AutomationBuilderCanvas } from '@/automations/components/builder/AutomationBuilderCanvas';
import {
  automationBuilderPanelOpenState,
  automationBuilderSiderbarOpenState,
  toggleAutomationBuilderOpenPanel,
  toggleAutomationBuilderOpenSidebar,
} from '@/automations/states/automationState';
import { AutomationsHotKeyScope } from '@/automations/types';
import {
  Icon,
  IconLayoutBottombarExpand,
  IconLayoutSidebarRightExpand,
  IconProps,
} from '@tabler/icons-react';
import {
  Badge,
  Button,
  Command,
  PageSubHeader,
  Resizable,
  Tooltip,
  usePreviousHotkeyScope,
  useScopedHotkeys,
} from 'erxes-ui';
import { useAtomValue, useSetAtom } from 'jotai';
import { useMemo } from 'react';

export const InspectorPanel = () => {
  const isPanelOpen = useAtomValue(automationBuilderPanelOpenState);
  const togglePanelOpen = useSetAtom(toggleAutomationBuilderOpenPanel);
  const { setHotkeyScopeAndMemorizePreviousScope } = usePreviousHotkeyScope();
  const isOpenSideBar = useAtomValue(automationBuilderSiderbarOpenState);
  const toggleSideBarOpen = useSetAtom(toggleAutomationBuilderOpenSidebar);
  const onOpen = () => {
    togglePanelOpen();
    setHotkeyScopeAndMemorizePreviousScope(AutomationsHotKeyScope.Builder);
  };

  useScopedHotkeys(`mod+i`, () => onOpen(), AutomationsHotKeyScope.Builder);

  const isMac = useMemo(
    () => /Mac|iPod|iPhone|iPad/.test(navigator.platform),
    [],
  );
  return (
    <Resizable.PanelGroup direction="vertical" className="w-full h-full">
      {/* Canvas */}
      <Resizable.Panel
        id="main-canvas"
        minSize={30}
        className="relative flex flex-row w-full"
      >
        <AutomationBuilderCanvas />
        <div className="bg-sidebar border-l h-full w-16 flex flex-col gap-2 items-center pt-2">
          <ToggleButton
            isOpen={isOpenSideBar}
            onToggle={toggleSideBarOpen}
            openLabel="Hide Menu"
            closedLabel="Show Menu"
            shortcut={`${isMac ? '⌘' : 'Ctrl'}G`}
            IconComponent={IconLayoutSidebarRightExpand}
          />
          <ToggleButton
            isOpen={isPanelOpen}
            onToggle={togglePanelOpen}
            openLabel="Hide Inspect"
            closedLabel="Show Inspect"
            shortcut={`${isMac ? '⌘' : 'Ctrl'}I`}
            IconComponent={IconLayoutBottombarExpand}
          />
        </div>
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

const ToggleButton = ({
  isOpen,
  onToggle,
  openLabel,
  closedLabel,
  shortcut,
  IconComponent,
}: {
  isOpen: boolean;
  onToggle: () => void;
  openLabel: React.ReactNode;
  closedLabel: React.ReactNode;
  shortcut: string;
  IconComponent: React.ForwardRefExoticComponent<
    IconProps & React.RefAttributes<Icon>
  >;
}) => {
  return (
    <Tooltip>
      <Tooltip.Trigger asChild>
        <Button
          variant="ghost"
          className="bg-sidebar text-primary"
          onClick={onToggle}
          asChild
        >
          <IconComponent className="size-16" />
        </Button>
      </Tooltip.Trigger>
      <Tooltip.Content
        side="left"
        className="flex flex-row gap-2 items-center bg-background text-primary border font-semibold"
      >
        {isOpen ? openLabel : closedLabel}
        <Badge variant="secondary">
          <Command.Shortcut>{shortcut}</Command.Shortcut>
        </Badge>
      </Tooltip.Content>
    </Tooltip>
  );
};
