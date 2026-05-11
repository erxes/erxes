import { useAtomValue } from 'jotai';
import {
  IconAlignBoxBottomCenter,
  IconAlignBoxCenterMiddle,
  IconAlignBoxLeftMiddle,
  IconAlignBoxRightMiddle,
  IconAlignBoxTopCenter,
  IconAlignCenter,
  IconLayoutDistributeHorizontal,
  IconLayoutDistributeVertical,
} from '@tabler/icons-react';
import {
  Input,
  Label as UILabel,
  ScrollArea,
  Select,
  Switch,
  Textarea,
} from 'erxes-ui';

import {
  pageDraftAtom,
  selectedNodeIdsAtom,
} from '../states/builderStates';
import { findNode } from '../utils/tree';
import { getDef } from '../elements/registry';
import { useBuilderActions } from '../hooks/useBuilderActions';
import { PropSchemaField } from '../elements/types';
import { BuilderNode } from '../types';

const Field = ({
  field,
  value,
  onChange,
}: {
  field: PropSchemaField;
  value: unknown;
  onChange: (next: unknown) => void;
}) => {
  switch (field.type) {
    case 'string':
    case 'url':
    case 'image':
      return (
        <Input
          value={(value as string) ?? ''}
          placeholder={('placeholder' in field && field.placeholder) || ''}
          onChange={(e) => onChange(e.target.value)}
        />
      );
    case 'text':
      return (
        <Textarea
          rows={4}
          value={(value as string) ?? ''}
          onChange={(e) => onChange(e.target.value)}
        />
      );
    case 'color':
      return (
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={(value as string) || '#000000'}
            onChange={(e) => onChange(e.target.value)}
            className="h-9 w-12 cursor-pointer rounded border"
          />
          <Input
            value={(value as string) || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder="#000000 or empty"
          />
        </div>
      );
    case 'number':
      return (
        <Input
          type="number"
          value={(value as number | undefined) ?? ''}
          min={field.min}
          max={field.max}
          onChange={(e) => {
            const v = e.target.value;
            if (v === '') return onChange(undefined);
            onChange(Number(v));
          }}
        />
      );
    case 'boolean':
      return (
        <Switch
          checked={!!value}
          onCheckedChange={(checked) => onChange(checked)}
        />
      );
    case 'select':
      return (
        <Select
          value={(value as string) ?? ''}
          onValueChange={(v) => onChange(v)}
        >
          <Select.Trigger className="w-full">
            <Select.Value
              placeholder={`Select ${field.label.toLowerCase()}`}
            />
          </Select.Trigger>
          <Select.Content>
            {field.options.map((opt) => (
              <Select.Item key={opt.value} value={opt.value}>
                {opt.label}
              </Select.Item>
            ))}
          </Select.Content>
        </Select>
      );
    default:
      return null;
  }
};

const NumberInput = ({
  label,
  value,
  placeholder,
  onCommit,
}: {
  label: string;
  value: number | undefined;
  placeholder?: string;
  onCommit: (n: number) => void;
}) => {
  return (
    <div className="flex items-center gap-1.5">
      <span className="w-3 text-xs uppercase text-muted-foreground">
        {label}
      </span>
      <Input
        type="number"
        value={value ?? ''}
        placeholder={placeholder}
        onChange={(e) => {
          const v = e.target.value;
          if (v === '') return;
          onCommit(Number(v));
        }}
        className="h-8"
      />
    </div>
  );
};

const FrameEditor = ({ node }: { node: BuilderNode }) => {
  const { setFrames, setZIndex, clearFrameSize } = useBuilderActions();
  const f = node.frame ?? { x: 0, y: 0 };
  return (
    <div className="space-y-3 rounded-md border bg-background/40 p-3">
      <div className="flex items-center justify-between">
        <UILabel className="text-xs font-semibold">Frame</UILabel>
        {(f.w !== undefined || f.h !== undefined) && (
          <button
            type="button"
            onClick={() => clearFrameSize(node.id)}
            className="text-[10px] text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
            title="Reset to content size"
          >
            Reset to auto
          </button>
        )}
      </div>
      <div className="grid grid-cols-2 gap-2">
        <NumberInput
          label="X"
          value={f.x}
          onCommit={(x) => setFrames([{ id: node.id, x }])}
        />
        <NumberInput
          label="Y"
          value={f.y}
          onCommit={(y) => setFrames([{ id: node.id, y }])}
        />
        <NumberInput
          label="W"
          value={f.w}
          placeholder="auto"
          onCommit={(w) => setFrames([{ id: node.id, w: Math.max(1, w) }])}
        />
        <NumberInput
          label="H"
          value={f.h}
          placeholder="auto"
          onCommit={(h) => setFrames([{ id: node.id, h: Math.max(1, h) }])}
        />
      </div>
      <div className="flex items-center gap-2">
        <UILabel className="w-12 text-xs">Z-index</UILabel>
        <Input
          type="number"
          value={node.zIndex ?? 0}
          onChange={(e) => {
            const v = e.target.value;
            if (v === '') return;
            setZIndex(node.id, Number(v));
          }}
          className="h-8"
        />
      </div>
    </div>
  );
};

const PaddingEditor = ({ node }: { node: BuilderNode }) => {
  const { setStyle } = useBuilderActions();
  const s = node.style ?? {};
  return (
    <div className="space-y-3 rounded-md border bg-background/40 p-3">
      <UILabel className="text-xs font-semibold">Padding</UILabel>
      <div className="grid grid-cols-2 gap-2">
        <NumberInput
          label="T"
          value={s.paddingTop}
          placeholder="0"
          onCommit={(v) => setStyle(node.id, { paddingTop: Math.max(0, v) })}
        />
        <NumberInput
          label="R"
          value={s.paddingRight}
          placeholder="0"
          onCommit={(v) => setStyle(node.id, { paddingRight: Math.max(0, v) })}
        />
        <NumberInput
          label="B"
          value={s.paddingBottom}
          placeholder="0"
          onCommit={(v) =>
            setStyle(node.id, { paddingBottom: Math.max(0, v) })
          }
        />
        <NumberInput
          label="L"
          value={s.paddingLeft}
          placeholder="0"
          onCommit={(v) => setStyle(node.id, { paddingLeft: Math.max(0, v) })}
        />
      </div>
      <button
        type="button"
        onClick={() => {
          const v =
            s.paddingTop ?? s.paddingRight ?? s.paddingBottom ?? s.paddingLeft;
          const n = typeof v === 'number' ? v : 0;
          setStyle(node.id, {
            paddingTop: n,
            paddingRight: n,
            paddingBottom: n,
            paddingLeft: n,
          });
        }}
        className="text-[10px] text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
      >
        Apply to all sides
      </button>
    </div>
  );
};

const AlignTools = ({ ids }: { ids: string[] }) => {
  const { alignSelection, distributeSelection } = useBuilderActions();
  const Btn = ({
    title,
    onClick,
    children,
  }: {
    title: string;
    onClick: () => void;
    children: React.ReactNode;
  }) => (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className="rounded p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
    >
      {children}
    </button>
  );
  return (
    <div className="space-y-2 rounded-md border bg-background/40 p-3">
      <UILabel className="text-xs font-semibold">
        Align ({ids.length} selected)
      </UILabel>
      <div className="flex flex-wrap items-center gap-1">
        <Btn title="Align left" onClick={() => alignSelection(ids, 'left')}>
          <IconAlignBoxLeftMiddle size={16} />
        </Btn>
        <Btn
          title="Align center horizontally"
          onClick={() => alignSelection(ids, 'center-x')}
        >
          <IconAlignCenter size={16} />
        </Btn>
        <Btn title="Align right" onClick={() => alignSelection(ids, 'right')}>
          <IconAlignBoxRightMiddle size={16} />
        </Btn>
        <span className="mx-1 h-4 w-px bg-border" />
        <Btn title="Align top" onClick={() => alignSelection(ids, 'top')}>
          <IconAlignBoxTopCenter size={16} />
        </Btn>
        <Btn
          title="Align middle vertically"
          onClick={() => alignSelection(ids, 'center-y')}
        >
          <IconAlignBoxCenterMiddle size={16} />
        </Btn>
        <Btn
          title="Align bottom"
          onClick={() => alignSelection(ids, 'bottom')}
        >
          <IconAlignBoxBottomCenter size={16} />
        </Btn>
      </div>
      {ids.length >= 3 && (
        <div className="flex items-center gap-1">
          <Btn
            title="Distribute horizontally"
            onClick={() => distributeSelection(ids, 'horizontal')}
          >
            <IconLayoutDistributeHorizontal size={16} />
          </Btn>
          <Btn
            title="Distribute vertically"
            onClick={() => distributeSelection(ids, 'vertical')}
          >
            <IconLayoutDistributeVertical size={16} />
          </Btn>
        </div>
      )}
    </div>
  );
};

const PRESET_BACKGROUNDS = [
  { label: 'White', value: '#ffffff' },
  { label: 'Off-white', value: '#fafafa' },
  { label: 'Cream', value: '#fff8ee' },
  { label: 'Slate', value: '#0f172a' },
  { label: 'Indigo', value: '#312e81' },
];

const PageInspector = () => {
  const draft = useAtomValue(pageDraftAtom);
  const { setPageBackground } = useBuilderActions();
  if (!draft) return null;
  const value = draft.background ?? '';
  return (
    <div className="flex h-full flex-col border-l bg-sidebar">
      <div className="border-b p-3">
        <h3 className="text-sm font-semibold">Page</h3>
        <p className="text-xs text-muted-foreground">
          Settings for this canvas. Click a component to edit its props.
        </p>
      </div>
      <ScrollArea className="flex-1">
        <div className="space-y-4 p-4">
          <div className="space-y-2 rounded-md border bg-background/40 p-3">
            <UILabel className="text-xs font-semibold">Background</UILabel>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={value || '#ffffff'}
                onChange={(e) => setPageBackground(e.target.value)}
                className="h-9 w-12 cursor-pointer rounded border"
              />
              <Input
                value={value}
                onChange={(e) => setPageBackground(e.target.value)}
                placeholder="#ffffff or any CSS color"
              />
              {value && (
                <button
                  type="button"
                  onClick={() => setPageBackground(undefined)}
                  className="text-[10px] text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
                  title="Reset to default"
                >
                  Reset
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {PRESET_BACKGROUNDS.map((p) => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => setPageBackground(p.value)}
                  className="h-6 w-6 rounded border ring-1 ring-border/30 transition hover:scale-110"
                  style={{ background: p.value }}
                  title={p.label}
                />
              ))}
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};

export const Inspector = () => {
  const draft = useAtomValue(pageDraftAtom);
  const selectedIds = useAtomValue(selectedNodeIdsAtom);
  const { setProp } = useBuilderActions();

  if (!draft) return null;

  if (selectedIds.length === 0) {
    return <PageInspector />;
  }

  if (selectedIds.length > 1) {
    return (
      <div className="flex h-full flex-col border-l bg-sidebar">
        <div className="border-b p-3">
          <h3 className="text-sm font-semibold">
            {selectedIds.length} selected
          </h3>
          <p className="text-xs text-muted-foreground">
            Align, distribute, or move as a group.
          </p>
        </div>
        <ScrollArea className="flex-1">
          <div className="space-y-4 p-4">
            <AlignTools ids={selectedIds} />
          </div>
        </ScrollArea>
      </div>
    );
  }

  const node = findNode(draft.root, selectedIds[0]);
  if (!node) return null;
  const def = getDef(node.type);
  if (!def) return null;

  return (
    <div className="flex h-full flex-col border-l bg-sidebar">
      <div className="border-b p-3">
        <h3 className="text-sm font-semibold">{def.label}</h3>
        <p className="text-xs text-muted-foreground">{def.description}</p>
      </div>
      <ScrollArea className="flex-1">
        <div className="space-y-4 p-4">
          {node.frame && <FrameEditor node={node} />}
          {node.frame && <PaddingEditor node={node} />}
          {def.propsSchema.length === 0 && (
            <p className="text-sm text-muted-foreground">
              This component has no editable properties.
            </p>
          )}
          {def.propsSchema.map((field) => (
            <div key={field.key} className="space-y-1.5">
              <UILabel className="text-xs font-medium">{field.label}</UILabel>
              <Field
                field={field}
                value={node.props[field.key]}
                onChange={(v) => setProp(node.id, field.key, v)}
              />
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};
