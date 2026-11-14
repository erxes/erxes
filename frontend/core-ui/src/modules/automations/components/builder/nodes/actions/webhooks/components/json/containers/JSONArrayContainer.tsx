import { useTranslation } from 'react-i18next';
import { memo } from 'react';
import { IconPlus } from '@tabler/icons-react';
import { Button } from 'erxes-ui';
import {
  TJSONBodyPath,
  useJSONArrayContainer,
} from '@/automations/components/builder/nodes/actions/webhooks/hooks/useJSONBodyTree';
import { JSONTreeNode } from '../editor/JSONTreeNode';

interface JSONArrayContainerProps {
  name: string;
  path: TJSONBodyPath;
  value: unknown[];
}

export const JSONArrayContainer = memo(function JSONArrayContainer({
  name,
  path,
  value,
}: JSONArrayContainerProps) {
  const { t } = useTranslation('automations');
  const { items, isEmpty, addItem } = useJSONArrayContainer(name, path, value);

  return (
    <div className="space-y-2">
      <div className="space-y-2">
        {items.map((item) => (
          <JSONTreeNode
            key={item.key}
            name={name}
            path={item.path}
            value={item.value}
          />
        ))}
        {isEmpty && (
          <div className="text-xs text-muted-foreground">
            {t('webhook-json-empty-array')}
          </div>
        )}
      </div>
      <Button variant="outline" size="sm" className="w-full" onClick={addItem}>
        <IconPlus className="mr-1 h-3 w-3" /> {t('webhook-json-add-item')}
      </Button>
    </div>
  );
});
