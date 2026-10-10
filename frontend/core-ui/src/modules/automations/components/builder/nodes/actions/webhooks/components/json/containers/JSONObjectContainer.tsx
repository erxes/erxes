import { useTranslation } from 'react-i18next';
import { memo, useState, useCallback, useMemo } from 'react';
import { useFormContext } from 'react-hook-form';
import { IconPlus } from '@tabler/icons-react';
import { Button, Input } from 'erxes-ui';
import { setAtJSONProperty } from '@/automations/components/builder/nodes/actions/webhooks/utils/outgoingWebhookBodyBuilder';
import { JSONTreeNode } from '../editor/JSONTreeNode';

type OutgoinWebhookBodyPath = Array<string | number>;

interface JSONObjectContainerProps {
  name: string;
  path: OutgoinWebhookBodyPath;
  value: Record<string, any>;
}

export const JSONObjectContainer = memo(function JSONObjectContainer({
  name,
  path,
  value,
}: JSONObjectContainerProps) {
  const { getValues, setValue } = useFormContext();
  const { t } = useTranslation('automations');
  const [newKey, setNewKey] = useState('');

  const apply = useCallback(
    (next: Record<string, any>) => {
      const root = getValues();
      const newRoot = setAtJSONProperty(root, path, next);
      setValue(name, newRoot[name], { shouldDirty: true, shouldTouch: true });
    },
    [getValues, name, path, setValue],
  );

  const addField = useCallback(() => {
    if (!newKey) return;
    apply({ ...(value ?? {}), [newKey]: '' });
    setNewKey('');
  }, [apply, newKey, value]);

  const renameKey = useCallback(
    (oldKey: string, nextKey: string) => {
      if (!nextKey || nextKey === oldKey) return;
      const { [oldKey]: oldVal, ...rest } = value ?? {};
      apply({ ...rest, [nextKey]: oldVal });
    },
    [apply, value],
  );

  const removeKey = useCallback(
    (key: string) => {
      const { [key]: _rm, ...rest } = value ?? {};
      apply(rest);
    },
    [apply, value],
  );

  const entries = useMemo(() => Object.entries(value ?? {}), [value]);

  return (
    <div className="space-y-2">
      <div className="space-y-2">
        {entries.map(([k, v]) => (
          <JSONTreeNode
            key={k}
            name={name}
            path={[...path, k]}
            value={v}
            additionalContent={
              <Input
                defaultValue={k}
                onBlur={(e) => renameKey(k, e.target.value)}
                className="h-8"
              />
            }
          />
        ))}
        {entries.length === 0 && (
          <div className="text-xs text-muted-foreground">
            {t('webhook-json-empty-object')}
          </div>
        )}
      </div>
      <div className="flex items-center gap-2">
        <Input
          placeholder={t('webhook-json-add-field-key-placeholder')}
          value={newKey}
          onChange={(e) => setNewKey(e.target.value)}
          className="h-8"
        />
        <Button variant="outline" size="sm" onClick={addField}>
          <IconPlus className="mr-1 h-3 w-3" /> {t('webhook-json-add')}
        </Button>
      </div>
    </div>
  );
});
