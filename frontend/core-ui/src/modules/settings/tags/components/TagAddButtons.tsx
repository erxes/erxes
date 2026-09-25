import { SettingsAddRowButton } from '@/settings/components/SettingsAddRowButton';
import { addingTagAtom } from '@/settings/tags/states/addingTagAtom';
import { SettingsHotKeyScope } from '@/types/SettingsHotKeyScope';
import { Button, cn, useQueryState } from 'erxes-ui';
import { useAtom } from 'jotai';

export const TagAddButtons = ({ className }: { className?: string }) => {
  const [type] = useQueryState<string>('tagType');
  const [addingTag, setAddingTag] = useAtom(addingTagAtom);
  return (
    <div className={cn('flex gap-2', className)}>
      <Button
        disabled={addingTag?.isGroup}
        onClick={() => {
          setAddingTag({
            isGroup: true,
            type,
          });
        }}
        variant="outline"
      >
        Add Group
      </Button>
      <SettingsAddRowButton
        label="Add Tag"
        disabled={addingTag !== null && !addingTag?.isGroup}
        onAdd={() => {
          setAddingTag({
            isGroup: false,
            type,
          });
        }}
        pageScope={SettingsHotKeyScope.TagsPage}
        formRowScope={SettingsHotKeyScope.TagsFormRow}
      />
    </div>
  );
};
