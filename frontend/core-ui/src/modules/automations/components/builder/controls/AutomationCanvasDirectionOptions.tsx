import { FlowDirectionIcon } from '@/automations/components/builder/controls/canvasOptionIcons';
import { useAutomationCanvasLayout } from '@/automations/components/builder/hooks/useAutomationCanvasLayout';
import { AUTOMATION_FLOW_DIRECTIONS } from '@/automations/constants/flowDirection';
import { DropdownMenu } from 'erxes-ui';

export const AutomationCanvasDirectionOptions = () => {
  const { flowDirection, onFlowDirectionChange } = useAutomationCanvasLayout();

  return (
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
  );
};
