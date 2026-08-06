import { useMemo } from 'react';
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  Controls,
  Handle,
  MarkerType,
  Position,
  type NodeProps,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import {
  IconBolt,
  IconRobot,
  IconArrowsSplit,
  IconArrowsJoin,
  IconFlag,
  IconTool,
  IconCircleDot,
} from '@tabler/icons-react';
import { buildWorkflowGraph, NODE_W, WfNodeData } from './layout';

// ── Custom node ───────────────────────────────────────────────────────────────

const KIND_STYLE: Record<
  string,
  { icon: React.ElementType; accent: string; label: string }
> = {
  trigger: {
    icon: IconBolt,
    accent: 'text-violet-500 bg-violet-500/10',
    label: 'Trigger',
  },
  operation: {
    icon: IconTool,
    accent: 'text-blue-500 bg-blue-500/10',
    label: 'Operation',
  },
  agent: {
    icon: IconRobot,
    accent: 'text-purple-500 bg-purple-500/10',
    label: 'Agent',
  },
  branch: {
    icon: IconArrowsSplit,
    accent: 'text-amber-500 bg-amber-500/10',
    label: 'Branch',
  },
  parallel: {
    icon: IconArrowsJoin,
    accent: 'text-cyan-500 bg-cyan-500/10',
    label: 'Parallel',
  },
  end: {
    icon: IconFlag,
    accent: 'text-emerald-600 bg-emerald-500/10',
    label: 'End',
  },
  other: {
    icon: IconCircleDot,
    accent: 'text-muted-foreground bg-muted',
    label: 'Step',
  },
};

// Ring color when a run's per-step status decorates the graph.
const STATUS_RING: Record<string, string> = {
  success: 'ring-2 ring-emerald-500/60',
  failed: 'ring-2 ring-red-500/70',
  running: 'ring-2 ring-blue-500/60 animate-pulse',
  suspended: 'ring-2 ring-amber-500/60',
};

const STATUS_DOT: Record<string, string> = {
  success: 'bg-emerald-500',
  failed: 'bg-red-500',
  running: 'bg-blue-500 animate-pulse',
  suspended: 'bg-amber-500',
};

const WorkflowNode = ({ data }: NodeProps) => {
  const d = data as WfNodeData;
  const style = KIND_STYLE[d.kind] || KIND_STYLE.other;
  const Icon = style.icon;
  const ring = d.status ? STATUS_RING[d.status] || '' : '';

  return (
    <div
      style={{ width: NODE_W }}
      className={`rounded-lg border border-border bg-background shadow-sm px-3 py-2.5 ${ring}`}
      title={d.error || undefined}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!bg-border !size-2"
      />
      <div className="flex items-start gap-2.5">
        <div className={`rounded-md p-1.5 shrink-0 ${style.accent}`}>
          <Icon className="size-4" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-medium truncate">{d.label}</span>
            {d.status && (
              <span
                className={`size-2 rounded-full shrink-0 ${STATUS_DOT[d.status] || 'bg-muted-foreground'}`}
              />
            )}
          </div>
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
            {style.label}
          </div>
          {d.subtitle && (
            <div className="text-xs text-muted-foreground font-mono truncate mt-0.5">
              {d.subtitle}
            </div>
          )}
          {d.error && (
            <div className="text-xs text-destructive truncate mt-0.5">
              {d.error}
            </div>
          )}
        </div>
      </div>
      {d.kind !== 'end' && (
        <Handle
          type="source"
          position={Position.Bottom}
          className="!bg-border !size-2"
        />
      )}
    </div>
  );
};

const nodeTypes = { wfNode: WorkflowNode };

// ── Graph ─────────────────────────────────────────────────────────────────────

export const WorkflowGraph = ({
  definition,
  stepsSummary,
  className,
}: {
  definition: any;
  // Latest run's per-step results — decorates nodes with live status.
  stepsSummary?: Record<string, { status?: string; error?: string }> | null;
  className?: string;
}) => {
  const { nodes, edges } = useMemo(
    () => buildWorkflowGraph(definition, stepsSummary),
    [definition, stepsSummary],
  );

  const flowEdges = useMemo(
    () =>
      edges.map((e) => ({
        ...e,
        type: 'smoothstep',
        markerEnd: { type: MarkerType.ArrowClosed, width: 16, height: 16 },
        style: { strokeWidth: 1.5 },
        labelStyle: { fontSize: 10, fontFamily: 'monospace' },
        labelBgPadding: [4, 2] as [number, number],
        labelBgBorderRadius: 4,
      })),
    [edges],
  );

  return (
    <div className={className}>
      <ReactFlow
        nodes={nodes}
        edges={flowEdges}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.2, maxZoom: 1 }}
        minZoom={0.2}
        nodesConnectable={false}
        deleteKeyCode={null}
        proOptions={{ hideAttribution: true }}
      >
        <Background variant={BackgroundVariant.Dots} gap={16} size={1} />
        <Controls showInteractive={false} />
      </ReactFlow>
    </div>
  );
};
