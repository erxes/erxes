import '@xyflow/react/dist/style.css';
import { IconSitemap } from '@tabler/icons-react';
import {
  Background,
  BackgroundVariant,
  Controls,
  Edge,
  Handle,
  MarkerType,
  Node,
  NodeProps,
  Position,
  ReactFlow,
  useNodesState,
} from '@xyflow/react';
import { cn, Spinner, useQueryState } from 'erxes-ui';
import { memo, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  IDataExtensionField,
  IDataExtensionRecordType,
  useDataExtensionFields,
} from 'ui-modules';
import { DataExtensionEmptyState } from './DataExtensionStates';
import { FieldTypeIcon } from './fieldTypeIcons';

const NODE_WIDTH = 280;
const HEADER_HEIGHT = 58;
const ROW_HEIGHT = 30;
const COLUMN_GAP = 140;
const ROW_GAP = 36;
// Cards list relations first and stop at this many rows; the field table
// holds the rest. Keeps the map readable at its fitted zoom.
const MAX_ROWS = 8;
const MAX_COLUMN_HEIGHT = 620;

type RecordTypeNodeData = {
  recordType: IDataExtensionRecordType;
  label: string;
  fields: IDataExtensionField[];
  hiddenCount: number;
  totalCount: number;
  selected: boolean;
  related: boolean;
};

type RecordTypeNode = Node<RecordTypeNodeData, 'recordType'>;

const RecordTypeNodeCard = memo(({ data }: NodeProps<RecordTypeNode>) => {
  const { t } = useTranslation('dataExtensions');

  return (
    <div
      className={cn(
        'cursor-pointer rounded-lg border bg-background text-left shadow-xs transition-[border-color,box-shadow,opacity] duration-200 hover:border-primary/50 hover:shadow-sm',
        data.selected && 'border-primary ring-2 ring-primary/15',
        !data.selected && !data.related && 'opacity-80',
      )}
      style={{ width: NODE_WIDTH }}
    >
      <Handle
        type="target"
        id="in"
        position={Position.Left}
        className="!size-2 !border-0 !bg-muted-foreground/60"
      />
      <header className="flex items-start justify-between gap-2 border-b px-3 py-2.5">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">{data.label}</p>
          <p className="truncate font-mono text-[11px] text-muted-foreground">
            {data.recordType.typeName}
          </p>
        </div>
        <span className="shrink-0 rounded bg-muted px-1.5 py-0.5 text-[11px] tabular-nums text-muted-foreground">
          {t('map.field-count', { count: data.totalCount })}
        </span>
      </header>
      <ul className="py-1">
        {data.fields.map((field) => (
          <li
            key={field._id}
            className="relative flex items-center gap-2 px-3 text-xs"
            style={{ height: ROW_HEIGHT }}
          >
            <FieldTypeIcon
              type={field.type}
              className={cn(
                'size-3.5',
                field.relation ? 'text-primary' : 'text-muted-foreground',
              )}
            />
            <span className="min-w-0 flex-1 truncate">{field.label}</span>
            {field.relation?.side === 'inverse' && (
              <span className="text-[11px] text-muted-foreground">
                {t('map.reverse')}
              </span>
            )}
            {field.relation?.side === 'source' && (
              <Handle
                type="source"
                id={field._id}
                position={Position.Right}
                className="!size-2 !border-0 !bg-primary"
              />
            )}
          </li>
        ))}
        {data.hiddenCount > 0 && (
          <li
            className="px-3 text-xs text-muted-foreground"
            style={{ height: ROW_HEIGHT, lineHeight: `${ROW_HEIGHT}px` }}
          >
            {t('map.more-fields', { count: data.hiddenCount })}
          </li>
        )}
        {!data.fields.length && (
          <li
            className="px-3 text-xs text-muted-foreground"
            style={{ height: ROW_HEIGHT, lineHeight: `${ROW_HEIGHT}px` }}
          >
            {t('map.no-fields')}
          </li>
        )}
      </ul>
    </div>
  );
});

RecordTypeNodeCard.displayName = 'RecordTypeNodeCard';

const nodeTypes = { recordType: RecordTypeNodeCard };

const nodeHeight = (rowCount: number) =>
  HEADER_HEIGHT + Math.max(rowCount, 1) * ROW_HEIGHT + 8;

/** Relations first (they carry the edges), then the remaining fields. */
const visibleRows = (fields: IDataExtensionField[]) => {
  const ordered = [
    ...fields.filter((field) => field.relation),
    ...fields.filter((field) => !field.relation),
  ];
  const shown = ordered.slice(0, MAX_ROWS);

  return { shown, hidden: ordered.length - shown.length };
};

/**
 * Lays out record types in one column per owning module, so links between
 * Core and Operation read left to right. Only record types that have fields
 * or are the current selection are drawn.
 */
const buildGraph = (
  recordTypes: IDataExtensionRecordType[],
  fields: IDataExtensionField[],
  selected: string | undefined,
  label: (recordType: IDataExtensionRecordType) => string,
  kindLabel: (field: IDataExtensionField) => string,
) => {
  const relationSources = fields.filter(
    (field) => field.relation?.side === 'source',
  );
  const related = new Set<string>();

  for (const field of relationSources) {
    const target = field.relation?.targetRecordType;

    if (field.recordType === selected && target) {
      related.add(target);
    }

    if (target === selected) {
      related.add(field.recordType);
    }
  }

  const visible = recordTypes.filter(
    (recordType) =>
      recordType.recordType === selected ||
      fields.some((field) => field.recordType === recordType.recordType),
  );
  const owners = Array.from(new Set(visible.map(({ owner }) => owner)));
  const nodes: RecordTypeNode[] = [];
  let column = 0;

  // Each module starts a new column; tall modules wrap into more columns.
  for (const owner of owners) {
    let y = 0;

    for (const recordType of visible.filter((item) => item.owner === owner)) {
      const ownFields = fields.filter(
        (field) => field.recordType === recordType.recordType,
      );
      const { shown, hidden } = visibleRows(ownFields);
      const height = nodeHeight(shown.length + (hidden ? 1 : 0));

      if (y > 0 && y + height > MAX_COLUMN_HEIGHT) {
        column++;
        y = 0;
      }

      nodes.push({
        id: recordType.recordType,
        type: 'recordType',
        position: { x: column * (NODE_WIDTH + COLUMN_GAP), y },
        data: {
          recordType,
          label: label(recordType),
          fields: shown,
          hiddenCount: hidden,
          totalCount: ownFields.length,
          selected: recordType.recordType === selected,
          related: related.has(recordType.recordType),
        },
      });
      y += height + ROW_GAP;
    }

    column++;
  }

  const renderedHandles = new Set(
    nodes.flatMap((node) => node.data.fields.map((field) => field._id)),
  );
  const edges: Edge[] = relationSources
    .filter(
      (field) =>
        renderedHandles.has(field._id) &&
        visible.some(
          (recordType) =>
            recordType.recordType === field.relation?.targetRecordType,
        ),
    )
    .map((field) => {
      const target = field.relation?.targetRecordType as string;
      const active = field.recordType === selected || target === selected;

      return {
        id: field._id,
        source: field.recordType,
        sourceHandle: field._id,
        target,
        targetHandle: 'in',
        type: 'smoothstep',
        label: `${field.label} · ${kindLabel(field)}`,
        labelStyle: { fontSize: 11 },
        labelBgPadding: [6, 3] as [number, number],
        labelBgBorderRadius: 4,
        // Motion marks the links of the record type being edited.
        animated: active,
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: active ? 'var(--primary)' : 'var(--muted-foreground)',
        },
        style: {
          stroke: active ? 'var(--primary)' : 'var(--muted-foreground)',
          strokeWidth: active ? 1.75 : 1.25,
          opacity: active || !selected ? 1 : 0.45,
        },
      };
    });

  return { nodes, edges };
};

/**
 * The tenant's data model at a glance: every record type with fields, its
 * fields, and the relations between them. Selecting a card switches the
 * page to that record type.
 */
export const DataExtensionModelMap = ({
  recordTypes,
  selected,
}: {
  recordTypes: IDataExtensionRecordType[];
  selected?: string;
}) => {
  const { t } = useTranslation('dataExtensions');
  const [, setRecordType] = useQueryState<string>('recordType');
  const { fields, loading } = useDataExtensionFields({ all: true });

  const graph = useMemo(
    () =>
      buildGraph(
        recordTypes,
        fields,
        selected,
        (recordType) =>
          t(`record-types.${recordType.recordType}`, recordType.label),
        (field) => t(`relation.kinds.${field.relation?.kind || 'manyToOne'}`),
      ),
    [recordTypes, fields, selected, t],
  );
  // Cards are held in flow state so they can be dragged; a new layout
  // replaces them when fields or the selection change.
  const [nodes, setNodes, onNodesChange] = useNodesState<RecordTypeNode>(
    graph.nodes,
  );
  const [hovered, setHovered] = useState<string | null>(null);

  useEffect(() => {
    setNodes(graph.nodes);
  }, [graph.nodes, setNodes]);

  // Hovering a card brings its links forward and fades the rest.
  const edges = useMemo(
    () =>
      hovered
        ? graph.edges.map((edge) => {
            const linked = edge.source === hovered || edge.target === hovered;

            return {
              ...edge,
              animated: linked || edge.animated,
              zIndex: linked ? 1 : 0,
              style: {
                ...edge.style,
                opacity: linked ? 1 : 0.2,
                strokeWidth: linked ? 2 : edge.style?.strokeWidth,
              },
            };
          })
        : graph.edges,
    [graph.edges, hovered],
  );

  if (loading && !fields.length) {
    return <Spinner />;
  }

  if (!fields.length) {
    return (
      <DataExtensionEmptyState
        icon={<IconSitemap />}
        title={t('map.empty-title')}
        description={t('map.empty-description')}
      />
    );
  }

  return (
    <section
      aria-label={t('map.title')}
      className="relative h-full min-h-[28rem] w-full"
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.2, maxZoom: 1 }}
        minZoom={0.3}
        maxZoom={1.5}
        onNodesChange={onNodesChange}
        nodesConnectable={false}
        nodesDraggable
        // A click that moves a few pixels is still a click, not a drag.
        nodeDragThreshold={4}
        nodeClickDistance={4}
        proOptions={{ hideAttribution: true }}
        onNodeClick={(_event, node) => setRecordType(node.id)}
        onNodeMouseEnter={(_event, node) => setHovered(node.id)}
        onNodeMouseLeave={() => setHovered(null)}
      >
        {/* Dots show that the canvas pans; kept faint so cards lead. */}
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} />
        <Controls showInteractive={false} position="bottom-right" />
      </ReactFlow>
      <p className="pointer-events-none absolute bottom-3 left-3 rounded-md border bg-background/90 px-2.5 py-1.5 text-xs text-muted-foreground">
        {t('map.legend')}
      </p>
    </section>
  );
};
