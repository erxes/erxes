import {
  useAutomationBuilderNodeMetaEditor,
  useAutomationNodeMetaInlineField,
} from '@/automations/components/builder/sidebar/hooks/useAutomationBuilderNodeMetaEditor';
import { NodeData } from '@/automations/types';
import { Input, cn } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

// In-place editing of the active node's label/description in the sidebar
// header, for every node type (trigger, action, workflow).
export const AutomationBuilderNodeMetaEditor = ({
  activeNode,
}: {
  activeNode: NodeData;
}) => {
  const { t } = useTranslation('automations');
  const { meta, activeNodeId, changeField } =
    useAutomationBuilderNodeMetaEditor(activeNode);

  return (
    <>
      <AutomationNodeMetaInlineField
        key={`${activeNodeId}-label`}
        value={meta.label}
        placeholder={t('sidebar-untitled')}
        onChange={changeField('label')}
        className="h-7 text-xl font-semibold leading-tight tracking-tight"
      />
      <AutomationNodeMetaInlineField
        key={`${activeNodeId}-description`}
        value={meta.description}
        placeholder={t('sidebar-add-description')}
        onChange={changeField('description')}
        className="h-5 text-sm leading-5 text-muted-foreground"
      />
    </>
  );
};

const AutomationNodeMetaInlineField = ({
  value,
  placeholder,
  onChange,
  className,
}: {
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
  className: string;
}) => {
  const {
    isEditing,
    startEditing,
    stopEditing,
    handleInputChange,
    handleKeyDown,
  } = useAutomationNodeMetaInlineField({ value, onChange });

  if (isEditing) {
    return (
      <Input
        autoFocus
        value={value}
        placeholder={placeholder}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onBlur={stopEditing}
        className={cn('-mx-1 w-full px-1 py-0', className)}
      />
    );
  }

  return (
    <button
      type="button"
      onClick={startEditing}
      className={cn(
        '-mx-1 block w-fit max-w-full truncate rounded px-1 text-left hover:bg-accent',
        className,
        !value && 'font-normal text-muted-foreground',
      )}
    >
      {value || placeholder}
    </button>
  );
};
