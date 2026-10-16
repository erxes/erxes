import { Combobox } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { TagsSelect } from 'ui-modules';

const SelectTagsTaskChip = ({
  value,
  label,
  taskId,
  onValueChange,
}: {
  value: string[];
  label: string;
  taskId?: string;
  onValueChange?: (value: string[]) => void;
}) => {
  const { t } = useTranslation('operation');

  return (
    <TagsSelect.Provider
      mode="multiple"
      value={value}
      type="operation:task"
      targetIds={taskId ? [taskId] : undefined}
      onValueChange={onValueChange}
    >
      <Combobox.ChipTrigger label={label}>
        <TagsSelect.Value placeholder={t('not-specified')} showValue />
      </Combobox.ChipTrigger>
      <Combobox.Content>
        <TagsSelect.Content />
      </Combobox.Content>
    </TagsSelect.Provider>
  );
};

const SelectTagsTaskRoot = ({
  taskId,
  value,
  label,
}: {
  taskId: string;
  value: string[];
  label: string;
}) => <SelectTagsTaskChip taskId={taskId} value={value} label={label} />;

const SelectTagsTaskFormItem = ({
  value,
  label,
  onValueChange,
}: {
  value: string[];
  label: string;
  onValueChange: (value: string[]) => void;
}) => (
  <SelectTagsTaskChip
    value={value}
    label={label}
    onValueChange={onValueChange}
  />
);

export const SelectTagsTask = Object.assign(SelectTagsTaskRoot, {
  FormItem: SelectTagsTaskFormItem,
});
