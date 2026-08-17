import { CANVAS_CONTROL_BUTTON_CLASS } from '@/automations/components/builder/controls/AutomationCanvasControlButton';
import { useAutomationCanvasExport } from '@/automations/components/builder/hooks/useAutomationCanvasExport';
import { useAutomationCanvasLayout } from '@/automations/components/builder/hooks/useAutomationCanvasLayout';
import {
  AUTOMATION_EDGE_TYPES,
  TAutomationEdgeType,
} from '@/automations/constants/edgeTypes';
import {
  AUTOMATION_FLOW_DIRECTIONS,
  TAutomationFlowDirection,
} from '@/automations/constants/flowDirection';
import { automationCanvasViewState } from '@/automations/states/automationState';
import {
  IconArrowDown,
  IconArrowRight,
  IconBraces,
  IconCornerDownRight,
  IconDownload,
  IconGridDots,
  IconLine,
  IconMap,
  IconMenu2,
  IconPhoto,
  IconRoute,
  IconVectorBezier2,
} from '@tabler/icons-react';
import { Button, DropdownMenu } from 'erxes-ui';
import { useAtom } from 'jotai';

const FlowDirectionIcon = ({ value }: { value: TAutomationFlowDirection }) =>
  value === 'vertical' ? <IconArrowDown /> : <IconArrowRight />;

const EdgeTypeIcon = ({ value }: { value: TAutomationEdgeType }) => {
  switch (value) {
    case 'straight':
      return <IconLine />;
    case 'step':
      return <IconCornerDownRight />;
    case 'smoothstep':
      return <IconRoute />;
    case 'default':
    default:
      return <IconVectorBezier2 />;
  }
};

export const AutomationCanvasOptionsMenu = () => {
  const [{ showGrid, showMiniMap }, setCanvasView] = useAtom(
    automationCanvasViewState,
  );
  const { edgeType, flowDirection, onEdgeTypeChange, onFlowDirectionChange } =
    useAutomationCanvasLayout();
  const { onExportPng, onExportSvg, onExportJson } =
    useAutomationCanvasExport();

  return (
    <DropdownMenu>
      <DropdownMenu.Trigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          title="Canvas options"
          className={CANVAS_CONTROL_BUTTON_CLASS}
        >
          <IconMenu2 className="size-4" />
        </Button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Content align="end" side="right" className="w-56">
        <DropdownMenu.Item
          onClick={() =>
            setCanvasView((view) => ({
              ...view,
              showMiniMap: !view.showMiniMap,
            }))
          }
        >
          <IconMap className="size-4" />
          {showMiniMap ? 'Hide minimap' : 'Show minimap'}
        </DropdownMenu.Item>
        <DropdownMenu.Item
          onClick={() =>
            setCanvasView((view) => ({ ...view, showGrid: !view.showGrid }))
          }
        >
          <IconGridDots className="size-4" />
          {showGrid ? 'Hide grid' : 'Show grid'}
        </DropdownMenu.Item>
        <DropdownMenu.Separator />
        <DropdownMenu.Sub>
          <DropdownMenu.SubTrigger>
            <FlowDirectionIcon value={flowDirection} />
            Direction
          </DropdownMenu.SubTrigger>
          <DropdownMenu.SubContent className="w-48">
            <DropdownMenu.RadioGroup
              value={flowDirection}
              onValueChange={onFlowDirectionChange}
            >
              {AUTOMATION_FLOW_DIRECTIONS.map(({ value, label }) => (
                <DropdownMenu.RadioItem key={value} value={value}>
                  <FlowDirectionIcon value={value} />
                  {label}
                </DropdownMenu.RadioItem>
              ))}
            </DropdownMenu.RadioGroup>
          </DropdownMenu.SubContent>
        </DropdownMenu.Sub>
        <DropdownMenu.Sub>
          <DropdownMenu.SubTrigger>
            <IconVectorBezier2 className="size-4" />
            Edge type
          </DropdownMenu.SubTrigger>
          <DropdownMenu.SubContent className="w-48">
            <DropdownMenu.RadioGroup
              value={edgeType}
              onValueChange={onEdgeTypeChange}
            >
              {AUTOMATION_EDGE_TYPES.map(({ value, label }) => (
                <DropdownMenu.RadioItem key={value} value={value}>
                  <EdgeTypeIcon value={value} />
                  {label}
                </DropdownMenu.RadioItem>
              ))}
            </DropdownMenu.RadioGroup>
          </DropdownMenu.SubContent>
        </DropdownMenu.Sub>
        <DropdownMenu.Sub>
          <DropdownMenu.SubTrigger>
            <IconDownload className="size-4" />
            Download
          </DropdownMenu.SubTrigger>
          <DropdownMenu.SubContent className="w-48">
            <DropdownMenu.Sub>
              <DropdownMenu.SubTrigger>
                <IconPhoto className="size-4" />
                PNG
              </DropdownMenu.SubTrigger>
              <DropdownMenu.SubContent className="w-48">
                <DropdownMenu.Item
                  onClick={() => onExportPng({ withBackground: true })}
                >
                  With background
                </DropdownMenu.Item>
                <DropdownMenu.Item
                  onClick={() => onExportPng({ withBackground: false })}
                >
                  Transparent
                </DropdownMenu.Item>
              </DropdownMenu.SubContent>
            </DropdownMenu.Sub>
            <DropdownMenu.Item onClick={onExportSvg}>
              <IconVectorBezier2 className="size-4" />
              SVG
            </DropdownMenu.Item>
            <DropdownMenu.Item onClick={onExportJson}>
              <IconBraces className="size-4" />
              Export JSON
            </DropdownMenu.Item>
          </DropdownMenu.SubContent>
        </DropdownMenu.Sub>
      </DropdownMenu.Content>
    </DropdownMenu>
  );
};
