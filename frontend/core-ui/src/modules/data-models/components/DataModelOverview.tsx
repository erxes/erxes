import { uniqueModelFields } from '../relationGroups';
import { overviewGridLayout, overviewRowHeight } from '../overviewLayout';
import {
  IconChevronDown,
  IconChevronRight,
  IconFocusCentered,
  IconRestore,
  IconMinus,
  IconPlus,
} from '@tabler/icons-react';
import {
  Background,
  BackgroundVariant,
  Panel,
  ReactFlow,
  ReactFlowProvider,
  useNodesState,
  useReactFlow,
  type Node,
  type NodeProps,
  Handle,
  Position,
  type Edge,
} from '@xyflow/react';
import { Button, Skeleton, themeState } from 'erxes-ui';
import { useAtomValue } from 'jotai';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDataModelFields } from '../hooks';
import { modelPath, type DataModel, type ModelField } from '../types';
import { DataModelFieldIcon, DataModelIcon } from './DataModelVisuals';
import '@xyflow/react/dist/style.css';

type ModelNode = Node<
  {
    model: DataModel;
    onFields: (modelId: string, fields: ModelField[]) => void;
  },
  'model'
>;

const DataModelOverviewNode = ({
  data: { model, onFields },
}: NodeProps<ModelNode>) => {
  const { fields, loading, error, retry } = useDataModelFields(model._id);
  const [expanded, setExpanded] = useState(false);
  useEffect(() => {
    if (!loading && !error) onFields(model._id, fields);
  }, [fields, loading, error, model._id, onFields]);
  const definitions = [
    ...model.systemFields.map((field) => ({
      id: `system:${field.code}`,
      label: field.name,
      type: field.type,
    })),
    ...uniqueModelFields(fields).map((field) => ({
      id: field._id,
      label: field.label,
      type: field.type,
    })),
  ];
  const visible = expanded ? definitions : definitions.slice(0, 6);
  return (
    <article className="relative w-64 rounded-md border bg-background text-foreground shadow-sm">
      <Handle
        type="target"
        position={Position.Top}
        isConnectable={false}
        className="!bg-muted-foreground"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        isConnectable={false}
        className="!bg-muted-foreground"
      />
      <header className="flex items-center justify-between gap-2 border-b bg-muted/30 px-3 py-2.5">
        <Link
          to={modelPath(model._id)}
          className="nodrag flex min-w-0 items-center gap-2 text-xs font-medium hover:text-primary"
        >
          <DataModelIcon name={model.name} icon={model.icon} />
          <span className="truncate">{model.labelPlural}</span>
          <IconChevronRight className="size-3 text-muted-foreground" />
        </Link>
        <span className="text-[10px] text-muted-foreground">
          {model.source === 'BUILTIN' ? 'Built-in' : 'Custom'}
        </span>
      </header>
      <div className="space-y-0.5 p-2">
        {visible.map((field) => (
          <div
            key={field.id}
            className="flex items-center gap-2 px-1 py-1 text-[11px]"
          >
            <span className="text-muted-foreground">
              <DataModelFieldIcon type={field.type} />
            </span>
            <span className="truncate">{field.label}</span>
          </div>
        ))}
        {loading && <Skeleton className="my-2 h-5 w-full" />}
        {error ? (
          <div className="nodrag space-y-1 p-1">
            <p className="text-xs text-destructive">
              Could not load custom fields.
            </p>
            <Button variant="ghost" size="sm" onClick={retry}>
              Try again
            </Button>
          </div>
        ) : (
          !loading &&
          definitions.length === 0 && (
            <p className="p-2 text-xs text-muted-foreground">No fields yet</p>
          )
        )}
        {!loading && !error && definitions.length > 6 && (
          <Button
            variant="ghost"
            size="sm"
            className="nodrag h-7 w-full justify-start gap-1 px-1 text-[10px] font-normal text-muted-foreground"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? (
              <IconChevronDown className="size-3" />
            ) : (
              <IconChevronRight className="size-3" />
            )}
            {expanded
              ? 'Show fewer fields'
              : `${definitions.length - visible.length} more fields`}
          </Button>
        )}
      </div>
    </article>
  );
};

const nodeTypes = { model: DataModelOverviewNode };

const DataModelOverviewCanvas = ({ models }: { models: DataModel[] }) => {
  const theme = useAtomValue(themeState);
  const [fieldsByModel, setFieldsByModel] = useState<
    Record<string, ModelField[]>
  >({});
  const onFields = useCallback((modelId: string, fields: ModelField[]) => {
    setFieldsByModel((previous) =>
      JSON.stringify(previous[modelId]) === JSON.stringify(fields)
        ? previous
        : { ...previous, [modelId]: fields },
    );
  }, []);
  const edges = useMemo<Edge[]>(() => {
    const connections = new Map<
      string,
      { source: DataModel; target: DataModel; fields: ModelField[] }
    >();
    for (const model of models)
      for (const field of fieldsByModel[model._id] ?? []) {
        const relation = field.relation;
        const target = models.find(
          (entry) => entry._id === relation?.targetModelId,
        );
        if (!relation || relation.isInverse || !target) continue;
        const key = JSON.stringify([model._id, target._id]);
        const current = connections.get(key);
        if (current) current.fields.push(field);
        else connections.set(key, { source: model, target, fields: [field] });
      }
    return [...connections].map(([id, { source, target, fields }]) => ({
      id,
      source: source._id,
      target: target._id,
      type: 'smoothstep',
      label:
        fields.length > 1
          ? `${fields.length} relations`
          : fields[0].relation?.multiple
          ? 'M:N'
          : 'N:1',
      ariaLabel: `${source.labelPlural} to ${target.labelPlural}: ${fields
        .map((field) => field.label)
        .join(', ')}`,
      style: { stroke: 'var(--muted-foreground)' },
      labelStyle: { fill: 'var(--foreground)', fontSize: 11 },
      labelBgStyle: { fill: 'var(--background)' },
    }));
  }, [models, fieldsByModel]);
  const moved = useRef(false);
  const [nodes, setNodes, onNodesChange] = useNodesState<ModelNode>([]);
  const rowHeight = overviewRowHeight(
    nodes.flatMap((node) =>
      node.measured?.height ? [node.measured.height] : [],
    ),
  );
  const positions = useMemo(
    () => overviewGridLayout(models, rowHeight),
    [models, rowHeight],
  );
  const initialNodes = useMemo<ModelNode[]>(
    () =>
      models.map((model) => ({
        id: model._id,
        type: 'model',
        position: positions[model._id],
        data: { model, onFields },
        ariaLabel: `${model.labelPlural} object`,
      })),
    [models, positions, onFields],
  );
  const { zoomIn, zoomOut, fitView } = useReactFlow();
  useEffect(() => {
    setNodes((previous) => {
      const next = initialNodes.map((definition) => {
        const current = previous.find((node) => node.id === definition.id);
        const position =
          moved.current && current ? current.position : definition.position;
        if (
          current &&
          current.data.model === definition.data.model &&
          current.position.x === position.x &&
          current.position.y === position.y
        )
          return current;
        return {
          ...current,
          ...definition,
          measured: current?.measured,
          position,
        };
      });
      return next.length === previous.length &&
        next.every((node, index) => node === previous[index])
        ? previous
        : next;
    });
  }, [initialNodes, setNodes]);
  const resetLayout = () => {
    moved.current = false;
    setNodes((previous) =>
      initialNodes.map((definition) => ({
        ...previous.find((node) => node.id === definition.id),
        ...definition,
      })),
    );
    requestAnimationFrame(() => {
      void fitView({ padding: 0.25, maxZoom: 1, duration: 200 });
    });
  };
  return (
    <div
      className="relative min-h-80 flex-1 bg-muted/15"
      role="region"
      aria-label="Data model overview"
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        snapToGrid
        snapGrid={[24, 24]}
        nodeDragThreshold={2}
        onNodeDragStart={() => {
          moved.current = true;
        }}
        nodesDraggable
        nodesConnectable={false}
        deleteKeyCode={null}
        fitView
        fitViewOptions={{ padding: 0.3, maxZoom: 1 }}
        minZoom={0.2}
        maxZoom={1.6}
        colorMode={theme}
        proOptions={{ hideAttribution: true }}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={24}
          size={1}
          color="var(--muted-foreground)"
          className="opacity-35"
        />
        <Panel position="bottom-left">
          <div className="flex items-center gap-0.5 rounded-md border bg-background p-1 shadow-xs">
            <Button
              variant="ghost"
              size="icon"
              aria-label="Zoom in"
              onClick={() => {
                void zoomIn();
              }}
            >
              <IconPlus />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Zoom out"
              onClick={() => {
                void zoomOut();
              }}
            >
              <IconMinus />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Fit objects to view"
              onClick={() => {
                void fitView({ padding: 0.3, maxZoom: 1, duration: 200 });
              }}
            >
              <IconFocusCentered />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={resetLayout}
              aria-label="Reset layout"
            >
              <IconRestore />
              Reset layout
            </Button>
          </div>
        </Panel>
        <Panel position="bottom-right">
          <p className="rounded bg-background/80 px-2 py-1 text-[11px] text-muted-foreground">
            Drag to move · Reset layout to restore
          </p>
        </Panel>
      </ReactFlow>
    </div>
  );
};

export const DataModelOverview = ({ models }: { models: DataModel[] }) => (
  <ReactFlowProvider>
    <DataModelOverviewCanvas models={models} />
  </ReactFlowProvider>
);
