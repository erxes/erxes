import { TAutomationEdgeType } from '@/automations/constants/edgeTypes';
import { TAutomationFlowDirection } from '@/automations/constants/flowDirection';
import {
  IconArrowDown,
  IconArrowRight,
  IconCornerDownRight,
  IconLine,
  IconRoute,
  IconVectorBezier2,
} from '@tabler/icons-react';

export const FlowDirectionIcon = ({
  value,
}: {
  value: TAutomationFlowDirection;
}) => (value === 'vertical' ? <IconArrowDown /> : <IconArrowRight />);

export const EdgeTypeIcon = ({ value }: { value: TAutomationEdgeType }) => {
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
