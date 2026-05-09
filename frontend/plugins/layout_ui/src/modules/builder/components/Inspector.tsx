import { useAtomValue } from 'jotai';
import {
  Input,
  Label as UILabel,
  ScrollArea,
  Select,
  Switch,
  Textarea,
} from 'erxes-ui';

import { pageDraftAtom, selectedNodeIdAtom } from '../states/builderStates';
import { findNode } from '../utils/tree';
import { getDef } from '../elements/registry';
import { useBuilderActions } from '../hooks/useBuilderActions';
import { PropSchemaField } from '../elements/types';

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

export const Inspector = () => {
  const draft = useAtomValue(pageDraftAtom);
  const selectedId = useAtomValue(selectedNodeIdAtom);
  const { setProp } = useBuilderActions();

  if (!draft) return null;

  const node = selectedId ? findNode(draft.root, selectedId) : null;

  if (!node) {
    return (
      <div className="flex h-full flex-col border-l bg-sidebar">
        <div className="border-b p-3">
          <h3 className="text-sm font-semibold">Inspector</h3>
        </div>
        <div className="flex flex-1 items-center justify-center p-6 text-center text-sm text-muted-foreground">
          Select a component on the canvas to edit its properties.
        </div>
      </div>
    );
  }

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
