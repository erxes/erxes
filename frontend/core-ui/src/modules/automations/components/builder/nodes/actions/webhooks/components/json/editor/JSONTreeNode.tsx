import { useTranslation } from 'react-i18next';
import { memo, ReactNode } from 'react';
import { IconChevronDown, IconChevronRight } from '@tabler/icons-react';
import { Button, Select } from 'erxes-ui';
import { JSON_PROPERTY_TYPE_OPTIONS } from '@/automations/components/builder/nodes/actions/webhooks/constants/outgoingWebhookForm';
import {
  TJSONBodyPath,
  useJSONTreeNode,
} from '@/automations/components/builder/nodes/actions/webhooks/hooks/useJSONBodyTree';
import { JSONPropertyEditor } from '../ui/JSONPropertyEditor';
import { JSONRemoveButton } from '../ui/JSONRemoveButton';
import { JSONObjectContainer } from '../containers/JSONObjectContainer';
import { JSONArrayContainer } from '../containers/JSONArrayContainer';

interface JSONTreeNodeProps {
  name: string;
  path: TJSONBodyPath;
  value: unknown;
  additionalContent?: ReactNode;
}

export const JSONTreeNode = memo(function JSONTreeNode({
  name,
  path,
  value,
  additionalContent,
}: JSONTreeNodeProps) {
  const { t } = useTranslation('automations');
  const {
    type,
    apply,
    expanded,
    toggleExpanded,
    toggleLabelKey,
    onChangeType,
    summary,
    canExpand,
    canRemove,
    objectValue,
    arrayValue,
  } = useJSONTreeNode(name, path, value);

  return (
    <div className="border rounded-md p-2 bg-muted/40">
      <div className="flex items-center gap-2">
        {canExpand && (
          <Button
            size="icon"
            variant="ghost"
            onClick={toggleExpanded}
            aria-label={t(toggleLabelKey)}
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
            {JSON_PROPERTY_TYPE_OPTIONS.map((option) => (
              <Select.Item key={option} value={option}>
                {option}
              </Select.Item>
            ))}
          </Select.Content>
        </Select>
        <div className="text-xs text-muted-foreground truncate flex-1">
          {summary}
        </div>
        {canRemove && <JSONRemoveButton name={name} path={path} />}
      </div>

      {expanded && (
        <div className="mt-2 pl-3 border-l">
          <JSONPropertyEditor type={type} value={value} onApply={apply} />

          {type === 'object' && (
            <JSONObjectContainer name={name} path={path} value={objectValue} />
          )}
          {type === 'array' && (
            <JSONArrayContainer name={name} path={path} value={arrayValue} />
          )}
        </div>
      )}
    </div>
  );
});
