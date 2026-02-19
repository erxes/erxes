import { AutomationBuilderCanvas } from '@/automations/components/builder/AutomationBuilderCanvas';
import { useAutomation } from '@/automations/context/AutomationProvider';
import { AutomationsHotKeyScope } from '@/automations/types';
import {
  Icon,
  // IconLayoutBottombarExpand,
  IconLayoutSidebarRightExpand,
  IconProps,
} from '@tabler/icons-react';
import {
  Badge,
  Button,
  Command,
  // PageSubHeader,
  Resizable,
  Spinner,
  Tooltip,
  useScopedHotkeys,
} from 'erxes-ui';
import { useAutomationBilderWorkSpace } from '@/automations/components/builder/hooks/useAutomationBilderWorkSpace';

export const AutomationBuilderWorkspace = () => {
  const { loading } = useAutomation();

  const {
    // isPanelOpen,
    // togglePanelOpen,
    isOpenSideBar,
    toggleSideBarOpen,
    onOpen,
    isMac,
  } = useAutomationBilderWorkSpace();

  useScopedHotkeys(`mod+i`, () => onOpen(), AutomationsHotKeyScope.Builder);
  if (loading) {
    return <Spinner />;
  }
  return (
    <Resizable.PanelGroup direction="vertical" className="w-full h-full">
      {/* Canvas */}
      <Resizable.Panel
        id="main-canvas"
        minSize={30}
        className="relative flex flex-row w-full"
      >
        <AutomationBuilderCanvas />
      </Resizable.Panel>

      {/* TODO: Add inspector panel when it is implemented */}
      {/* {isPanelOpen && (
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
      )} */}
    </Resizable.PanelGroup>
  );
};

const AutomationBuilderPanelToggle = ({
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
          className="bg-sidebar text-primary w-full aspect-square size-16 [&>svg]:size-5"
          onClick={onToggle}
        >
          <IconComponent />
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
