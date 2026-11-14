import { useTranslation } from 'react-i18next';
import { memo } from 'react';
import { IconPlus } from '@tabler/icons-react';
import { Button, Input } from 'erxes-ui';
import {
  TJSONBodyPath,
  useJSONObjectContainer,
} from '@/automations/components/builder/nodes/actions/webhooks/hooks/useJSONBodyTree';
import { JSONTreeNode } from '../editor/JSONTreeNode';

interface JSONObjectContainerProps {
  name: string;
  path: TJSONBodyPath;
  value: Record<string, unknown>;
}

export const JSONObjectContainer = memo(function JSONObjectContainer({
  name,
  path,
  value,
}: JSONObjectContainerProps) {
  const { t } = useTranslation('automations');
  const { entries, isEmpty, newKey, onNewKeyChange, addField, renameOnBlur } =
    useJSONObjectContainer(name, path, value);

  return (
    <div className="space-y-2">
      <div className="space-y-2">
        {entries.map((entry) => (
          <JSONTreeNode
            key={entry.key}
            name={name}
            path={entry.path}
            value={entry.value}
            additionalContent={
              <Input
                defaultValue={entry.key}
                onBlur={renameOnBlur(entry.key)}
                className="h-8"
              />
            }
          />
        ))}
        {isEmpty && (
          <div className="text-xs text-muted-foreground">
            {t('webhook-json-empty-object')}
          </div>
        )}
      </div>
      <div className="flex items-center gap-2">
        <Input
          placeholder={t('webhook-json-add-field-key-placeholder')}
          value={newKey}
          onChange={onNewKeyChange}
          className="h-8"
        />
        <Button variant="outline" size="sm" onClick={addField}>
          <IconPlus className="mr-1 h-3 w-3" /> {t('webhook-json-add')}
        </Button>
      </div>
    </div>
  );
});
