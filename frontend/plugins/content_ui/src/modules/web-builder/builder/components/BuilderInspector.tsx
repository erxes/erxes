import {
  Button,
  Input,
  Select,
  Textarea,
} from 'erxes-ui';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { IconTrash } from '@tabler/icons-react';
import { useMemo } from 'react';
import { BLOCK_REGISTRY } from '../../blocks/registry';
import { BlockInstance, PropSchemaEntry } from '../../blocks/types';
import { useBuilderContext } from '../BuilderContext';
import {
  blocksAtom,
  dirtyAtom,
  selectedBlockIdAtom,
} from '../state/builderState';
import { CmsRefInput } from './inspector/CmsRefInput';

const FieldLabel = ({ children }: { children: React.ReactNode }) => (
  <label className="text-xs font-medium text-muted-foreground block">
    {children}
  </label>
);

interface FieldProps {
  schema: PropSchemaEntry;
  value: unknown;
  onChange: (value: unknown) => void;
  clientPortalId: string;
  // For cmsRef fields, the selection persists in BlockInstance.contentTypeId
  // rather than props, but we route both through the same handler.
  cmsRefValue?: string;
  onCmsRefChange?: (value: string | undefined) => void;
}

const Field = ({
  schema,
  value,
  onChange,
  clientPortalId,
  cmsRefValue,
  onCmsRefChange,
}: FieldProps) => {
  switch (schema.type) {
    case 'text':
    case 'url':
    case 'image':
      return (
        <Input
          value={(value as string) ?? ''}
          placeholder={schema.placeholder}
          onChange={(e) => onChange(e.target.value)}
        />
      );
    case 'longText':
      return (
        <Textarea
          rows={3}
          value={(value as string) ?? ''}
          placeholder={schema.placeholder}
          onChange={(e) => onChange(e.target.value)}
        />
      );
    case 'number':
      return (
        <Input
          type="number"
          min={schema.min}
          max={schema.max}
          value={(value as number) ?? ''}
          onChange={(e) => {
            const v = e.target.value;
            onChange(v === '' ? undefined : Number(v));
          }}
        />
      );
    case 'color':
      return (
        <Input
          type="color"
          value={(value as string) || '#000000'}
          onChange={(e) => onChange(e.target.value)}
          className="h-9 w-20 p-1"
        />
      );
    case 'select':
      return (
        <Select
          value={(value as string) ?? ''}
          onValueChange={(v) => onChange(v)}
        >
          <Select.Trigger className="w-full">
            <Select.Value />
          </Select.Trigger>
          <Select.Content>
            {schema.options.map((opt) => (
              <Select.Item key={opt.value} value={opt.value}>
                {opt.label}
              </Select.Item>
            ))}
          </Select.Content>
        </Select>
      );
    case 'cmsRef':
      return (
        <CmsRefInput
          kind={schema.kind}
          clientPortalId={clientPortalId}
          value={cmsRefValue}
          onChange={(v) => onCmsRefChange?.(v)}
        />
      );
    default:
      return null;
  }
};

export const BuilderInspector = () => {
  const [blocks, setBlocks] = useAtom(blocksAtom);
  const selectedId = useAtomValue(selectedBlockIdAtom);
  const setSelected = useSetAtom(selectedBlockIdAtom);
  const setDirty = useSetAtom(dirtyAtom);
  const { clientPortalId } = useBuilderContext();

  const block = useMemo(
    () => blocks.find((b) => b._id === selectedId) || null,
    [blocks, selectedId],
  );

  if (!block) {
    return (
      <aside className="w-72 border-l bg-card flex flex-col p-4 text-sm text-muted-foreground">
        Select a block to edit its properties.
      </aside>
    );
  }

  const def = BLOCK_REGISTRY[block.key];
  if (!def) {
    return (
      <aside className="w-72 border-l bg-card flex flex-col p-4 text-sm text-destructive">
        Unknown block: {block.key}
      </aside>
    );
  }

  const updateProp = (key: string, value: unknown) => {
    setBlocks((prev: BlockInstance[]) =>
      prev.map((b) =>
        b._id === block._id
          ? { ...b, props: { ...b.props, [key]: value } }
          : b,
      ),
    );
    setDirty(true);
  };

  const updateCmsRef = (value: string | undefined) => {
    setBlocks((prev: BlockInstance[]) =>
      prev.map((b) =>
        b._id === block._id
          ? {
              ...b,
              contentType: def.contentType,
              contentTypeId: value,
            }
          : b,
      ),
    );
    setDirty(true);
  };

  const onDelete = () => {
    setBlocks((prev: BlockInstance[]) => prev.filter((b) => b._id !== block._id));
    setSelected(null);
    setDirty(true);
  };

  return (
    <aside className="w-80 border-l bg-card flex flex-col">
      <div className="px-4 py-3 border-b flex items-center justify-between">
        <div>
          <div className="text-xs text-muted-foreground uppercase tracking-wide">
            {def.level}
          </div>
          <div className="font-semibold">{def.label}</div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="text-destructive hover:text-destructive"
          onClick={onDelete}
          title="Delete block"
        >
          <IconTrash size={16} />
        </Button>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {Object.entries(def.propSchema).map(([key, schema]) => (
          <div key={key} className="space-y-1.5">
            <FieldLabel>{schema.label}</FieldLabel>
            <Field
              schema={schema}
              value={block.props[key]}
              onChange={(v) => updateProp(key, v)}
              clientPortalId={clientPortalId}
              cmsRefValue={block.contentTypeId}
              onCmsRefChange={updateCmsRef}
            />
          </div>
        ))}
      </div>
    </aside>
  );
};
