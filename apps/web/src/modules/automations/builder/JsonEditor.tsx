import { IconPlus, IconX } from '@tabler/icons-react';
import { Button, cn, Input, oneOf, Select, Switch } from 'erxes-ui';
import { createContext, useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  blank,
  isEmptyValue,
  type JsonNode,
  KINDS,
  type Kind,
  nodeOf,
  removeItem,
  repeatedKeys,
  replaceItem,
  valueOf,
  withKind,
} from './jsonModel';
import { JsonTools } from './JsonTools';
import { TemplateInput } from './TemplateInput';
import type { FieldInfo } from './useAutomationFields';

const KIND_LABELS: Record<Kind, string> = {
  text: 'Text',
  number: 'Number',
  boolean: 'Yes/No',
  object: 'Object',
  list: 'List',
  empty: 'Empty',
};

const Shared = createContext<{
  fields: FieldInfo[];
  subject: 'customer' | 'company';
  disabled: boolean;
  flat: boolean;
  plain: boolean;
}>({ fields: [], subject: 'customer', disabled: false, flat: false, plain: false });

const KindSelect = ({
  kind,
  kinds = KINDS,
  onChange,
}: {
  kind: Kind;
  kinds?: readonly Kind[];
  onChange: (kind: Kind) => void;
}) => {
  const { t } = useTranslation('automations');
  const { disabled } = useContext(Shared);

  return (
    <Select
      value={kind}
      disabled={disabled}
      onValueChange={(next) => {
        const picked = oneOf(KINDS, next);

        if (picked) onChange(picked);
      }}
    >
      <Select.Trigger className="h-7 w-24 shrink-0" aria-label={t('json-kind', 'Type')}>
        <Select.Value />
      </Select.Trigger>
      <Select.Content>
        {kinds.map((item) => (
          <Select.Item key={item} value={item}>
            {t(`json-kind-${item}`, KIND_LABELS[item])}
          </Select.Item>
        ))}
      </Select.Content>
    </Select>
  );
};

const ValueInput = ({ node, onChange }: { node: JsonNode; onChange: (node: JsonNode) => void }) => {
  const { t } = useTranslation('automations');
  const { fields, subject, disabled, plain } = useContext(Shared);
  const label = node.key || t('json-value', 'Value');

  switch (node.kind) {
    case 'text':
      return plain ? (
        <Input
          className="h-7"
          aria-label={label}
          value={node.text}
          disabled={disabled}
          onChange={(event) => onChange({ ...node, text: event.target.value })}
        />
      ) : (
        <TemplateInput
          label={label}
          value={node.text}
          fields={fields}
          subject={subject}
          disabled={disabled}
          onChange={(text) => onChange({ ...node, text })}
        />
      );
    case 'number':
      return (
        <Input
          type="number"
          className="h-7"
          aria-label={label}
          value={node.text}
          disabled={disabled}
          onChange={(event) => onChange({ ...node, text: event.target.value })}
        />
      );
    case 'boolean':
      return (
        <Switch
          aria-label={label}
          checked={node.on}
          disabled={disabled}
          onCheckedChange={(on) => onChange({ ...node, on })}
        />
      );
    case 'empty':
      return <span className="text-xs text-muted-foreground">{t('json-empty', 'Nothing')}</span>;
    case 'object':
    case 'list':
      return null;
  }
};

const Entry = ({
  node,
  inList,
  repeated,
  onChange,
  onRemove,
}: {
  node: JsonNode;
  inList: boolean;
  repeated: boolean;
  onChange: (node: JsonNode) => void;
  onRemove: () => void;
}) => {
  const { t } = useTranslation('automations');
  const { disabled, flat } = useContext(Shared);

  return (
    <li className="space-y-1.5">
      <div className="flex items-start gap-1.5">
        {!inList && (
          <Input
            className="h-7 w-32 shrink-0"
            text="code"
            aria-invalid={repeated ? true : undefined}
            aria-label={t('json-key', 'Name')}
            placeholder={t('json-key', 'Name')}
            value={node.key}
            disabled={disabled}
            onChange={(event) => onChange({ ...node, key: event.target.value })}
          />
        )}
        {!flat && (
          <KindSelect kind={node.kind} onChange={(kind) => onChange(withKind(node, kind))} />
        )}
        <div className="flex min-h-7 min-w-0 flex-1 items-center">
          <ValueInput node={node} onChange={onChange} />
        </div>
        {!disabled && (
          <Button
            variant="ghost"
            size="icon"
            tone="muted"
            className="size-7 shrink-0"
            aria-label={t('json-remove', 'Remove')}
            onClick={onRemove}
          >
            <IconX />
          </Button>
        )}
      </div>
      {(node.kind === 'object' || node.kind === 'list') && (
        <Entries node={node} onChange={onChange} nested />
      )}
    </li>
  );
};

const Entries = ({
  node,
  onChange,
  nested,
}: {
  node: JsonNode;
  onChange: (node: JsonNode) => void;
  nested?: boolean;
}) => {
  const { t } = useTranslation('automations');
  const { disabled } = useContext(Shared);
  const repeated = repeatedKeys(node);
  const inList = node.kind === 'list';

  return (
    <div className={cn('space-y-1.5', nested && 'ml-3 border-l pl-3')}>
      {node.items.length > 0 && (
        <ul className="space-y-1.5">
          {node.items.map((item) => (
            <Entry
              key={item.id}
              node={item}
              inList={inList}
              repeated={repeated.has(item.key.trim())}
              onChange={(next) => onChange(replaceItem(node, next))}
              onRemove={() => onChange(removeItem(node, item.id))}
            />
          ))}
        </ul>
      )}
      {repeated.size > 0 && (
        <p className="text-xs text-destructive-text">
          {t('json-repeated', 'Each name once: the last one wins.')}
        </p>
      )}
      {!disabled && (
        <Button
          variant="ghost"
          size="sm"
          tone="muted"
          className="-ml-2 h-7"
          onClick={() => onChange({ ...node, items: [...node.items, blank('text')] })}
        >
          <IconPlus />
          {inList ? t('json-add-item', 'Add item') : t('json-add-field', 'Add field')}
        </Button>
      )}
    </div>
  );
};

/**
 * A JSON value as rows of name, type and value, nested for objects and lists. Text values take
 * the run's data as chips. `flat`: names and text only, as headers are.
 */
export const JsonEditor = ({
  label,
  value,
  onChange,
  fields,
  subject,
  disabled = false,
  flat = false,
  plain = false,
  rootKinds = ['object', 'list', 'text'],
}: {
  label: string;
  value: unknown;
  onChange: (value: unknown) => void;
  fields: FieldInfo[];
  subject: 'customer' | 'company';
  disabled?: boolean;
  flat?: boolean;
  plain?: boolean;
  rootKinds?: readonly Kind[];
}) => {
  const [root, setRoot] = useState(() =>
    value === undefined || value === null ? blank('object') : nodeOf(value),
  );

  const change = (next: JsonNode) => {
    setRoot(next);

    const json = valueOf(next);

    onChange(isEmptyValue(json) ? undefined : json);
  };

  return (
    <Shared.Provider value={{ fields, subject, disabled, flat, plain }}>
      <fieldset className="min-w-0 space-y-2 rounded-md border p-2" aria-label={label}>
        {!flat && rootKinds.length > 1 && (
          <KindSelect
            kind={root.kind}
            kinds={rootKinds}
            onChange={(kind) => change(withKind(root, kind))}
          />
        )}
        {root.kind === 'object' || root.kind === 'list' ? (
          <Entries node={root} onChange={change} />
        ) : (
          <ValueInput node={root} onChange={change} />
        )}
        <JsonTools
          value={valueOf(root)}
          disabled={disabled}
          onPaste={(json) => change(nodeOf(json))}
        />
      </fieldset>
    </Shared.Provider>
  );
};
