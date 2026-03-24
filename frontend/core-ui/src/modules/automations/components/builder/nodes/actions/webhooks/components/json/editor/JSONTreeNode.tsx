import { memo, useState, useMemo, useCallback } from 'react';
import { useFormContext } from 'react-hook-form';
import { IconChevronDown, IconChevronRight } from '@tabler/icons-react';
import { Button, Select } from 'erxes-ui';
import { JSON_PROPERTY_TYPE_OPTIONS } from '@/automations/components/builder/nodes/actions/webhooks/constants/outgoingWebhookForm';
import {
  detectJSONPropertyValueType,
  defaultPropertyValueForType,
  setAtJSONProperty,
} from '@/automations/components/builder/nodes/actions/webhooks/utils/outgoingWebhookBodyBuilder';
import { JSONPropertyEditor } from '../ui/JSONPropertyEditor';
import { JSONRemoveButton } from '../ui/JSONRemoveButton';
import { JSONObjectContainer } from '../containers/JSONObjectContainer';
import { JSONArrayContainer } from '../containers/JSONArrayContainer';

type OutgoinWebhookBodyPath = Array<string | number>;

interface JSONTreeNodeProps {
  name: string;
  path: OutgoinWebhookBodyPath;
  value: any;
  additionalContent?: React.ReactNode;
}

export const JSONTreeNode = memo(function JSONTreeNode({
  name,
  path,
  value,
  additionalContent,
}: JSONTreeNodeProps) {
  const { getValues, setValue } = useFormContext();
  const type = useMemo(() => detectJSONPropertyValueType(value), [value]);
  const [expanded, setExpanded] = useState(false);

  const applyNode = useCallback(
    (next: any) => {
      const root = getValues();
      const newRoot = setAtJSONProperty(root, path, next);
      setValue(name, newRoot[name], { shouldDirty: true, shouldTouch: true });
    },
    [getValues, name, path, setValue],
  );

  const onChangeType = useCallback(
    (t: string) => applyNode(defaultPropertyValueForType(t as any)),
    [applyNode],
  );

  const summary = useMemo(() => {
    if (type === 'object') return `{ ${Object.keys(value || {}).length} keys }`;
    if (type === 'array') return `[ ${(value as any[])?.length ?? 0} items ]`;
    if (type === 'null') return 'null';
    if (type === 'boolean') return String(Boolean(value));
    return String(value ?? '');
  }, [type, value]);

  return (
    <div className="border rounded-md p-2 bg-muted/40">
      <div className="flex items-center gap-2">
        {(type === 'object' || type === 'array') && (
          <Button
            size="icon"
            variant="ghost"
            onClick={() => setExpanded(!expanded)}
            aria-label={expanded ? 'Collapse' : 'Expand'}
          >
            {expanded ? (
              <IconChevronDown className="h-3 w-3" />
            ) : (
              <IconChevronRight className="h-3 w-3" />
            )}
          </Button>
        )}
        {additionalContent}
        <Select value={type} onValueChange={onChangeType}>
          <Select.Trigger className="h-7 w-36">
            <Select.Value />
          </Select.Trigger>
          <Select.Content>
            {JSON_PROPERTY_TYPE_OPTIONS.map((t) => (
              <Select.Item key={t} value={t}>
                {t}
              </Select.Item>
            ))}
          </Select.Content>
        </Select>
        <div className="text-xs text-muted-foreground truncate flex-1">
          {summary}
        </div>
        {path.length > 1 && <JSONRemoveButton name={name} path={path} />}
      </div>

      {expanded && (
        <div className="mt-2 pl-3 border-l">
          <JSONPropertyEditor type={type} value={value} onApply={applyNode} />

          {type === 'object' && (
            <JSONObjectContainer name={name} path={path} value={value ?? {}} />
          )}
          {type === 'array' && (
            <JSONArrayContainer
              name={name}
              path={path}
              value={Array.isArray(value) ? value : []}
            />
          )}
        </div>
      )}
    </div>
  );
});
