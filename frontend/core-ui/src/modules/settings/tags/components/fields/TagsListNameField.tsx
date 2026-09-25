import { useTagEdit } from 'ui-modules';
import { SettingsHotKeyScope } from '@/types/SettingsHotKeyScope';
import { SettingsInlineNameField } from '@/settings/components/SettingsInlineNameField';

export const TagsListNameField = ({
  name,
  id,
  defaultOpen,
  handleSave,
  isForm = false,
  onEscape,
}: {
  name: string;
  id?: string;
  defaultOpen?: boolean;
  handleSave?: (name: string) => void;
  isForm?: boolean;
  onEscape?: () => void;
}) => {
  const { editTag } = useTagEdit();

  const onSave = (newName: string) => {
    if (handleSave) {
      handleSave(newName);
      return;
    }
    if (id) {
      editTag({
        variables: {
          id,
          name: newName,
        },
      });
    }
  };

  if (!id && !isForm) {
    throw new Error(
      'Id is required when editing tag, Add id or use isForm prop',
    );
  }
  return (
    <SettingsInlineNameField
      name={name}
      placeholder="Add tag name"
      scope={SettingsHotKeyScope.TagsInput}
      onSave={onSave}
      defaultOpen={defaultOpen}
      isForm={isForm}
      onEscape={onEscape}
    />
  );
};
