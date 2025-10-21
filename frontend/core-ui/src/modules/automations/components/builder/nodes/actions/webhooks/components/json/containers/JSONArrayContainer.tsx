import { memo, useCallback } from 'react';
import { useFormContext } from 'react-hook-form';
import { IconPlus } from '@tabler/icons-react';
import { Button } from 'erxes-ui';
import { setAtJSONProperty } from '@/automations/components/builder/nodes/actions/webhooks/utils/outgoingWebhookBodyBuilder';
import { JSONTreeNode } from '../editor/JSONTreeNode';

type OutgoinWebhookBodyPath = Array<string | number>;

interface JSONArrayContainerProps {
  name: string;
  path: OutgoinWebhookBodyPath;
  value: any[];
}

export const JSONArrayContainer = memo(function JSONArrayContainer({
  name,
  path,
  value,
}: JSONArrayContainerProps) {
  const { getValues, setValue } = useFormContext();

  const apply = useCallback(
    (next: any[]) => {
      const root = getValues();
      const newRoot = setAtJSONProperty(root, path, next);
      setValue(name, newRoot[name], { shouldDirty: true, shouldTouch: true });
    },
    [getValues, name, path, setValue],
  );

  const addItem = useCallback(
    () => apply([...(value ?? []), '']),
    [apply, value],
  );

  const removeItem = useCallback(
    (idx: number) =>
      apply([...(value ?? []).slice(0, idx), ...(value ?? []).slice(idx + 1)]),
    [apply, value],
  );

  return (
    <div className="space-y-2">
      <div className="flex justify-end">
        <Button variant="outline" size="sm" onClick={addItem}>
          <IconPlus className="mr-1 h-3 w-3" /> Add item
        </Button>
      </div>
      <div className="space-y-2">
        {(value ?? []).map((item, idx) => (
          <JSONTreeNode
            key={idx}
            name={name}
            path={[...path, idx]}
            value={item}
          />
        ))}
        {(value ?? []).length === 0 && (
          <div className="text-xs text-muted-foreground">Empty array</div>
        )}
      </div>
    </div>
  );
});
