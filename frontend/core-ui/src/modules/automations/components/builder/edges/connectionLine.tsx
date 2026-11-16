import { useConnectionLine } from '@/automations/components/builder/hooks/useConnectionLine';
import { ConnectionLineComponentProps } from '@xyflow/react';
import { cn } from 'erxes-ui';

const ConnectionLine = (props: ConnectionLineComponentProps) => {
  const {
    edgePath,
    isFromAction,
    isFromTrigger,
    isErrorBranch,
    isDefaultBranch,
  } = useConnectionLine(props);

  return (
    <g>
      <path
        fill="none"
        className={cn({
          'stroke-success': isFromAction,
          'stroke-primary': isFromTrigger,
          'stroke-destructive': isErrorBranch,
          'stroke-info': isDefaultBranch,
        })}
        strokeWidth={2}
        d={edgePath}
      />

      <circle
        cx={props.toX}
        cy={props.toY}
        fill="#fff"
        r={10}
        className={cn('fill-white stroke-success stroke-2', {
          'stroke-destructive': isErrorBranch,
        })}
        strokeWidth={4}
      />
    </g>
  );
};

export default ConnectionLine;
