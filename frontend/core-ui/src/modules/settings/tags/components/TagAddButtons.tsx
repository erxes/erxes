import {
  Button,
  useQueryState,
  Kbd,
  usePreviousHotkeyScope,
  cn,
} from 'erxes-ui';
import { addingTagAtom } from '@/settings/tags/states/addingTagAtom';
import { useAtom } from 'jotai';
import { IconPlus } from '@tabler/icons-react';
import { useScopedHotkeys } from 'erxes-ui';
import { SettingsHotKeyScope } from '@/types/SettingsHotKeyScope';
export const TagAddButtons = ({ className }: { className?: string }) => {
  const [type] = useQueryState<string>('tagType');
  const [addingTag, setAddingTag] = useAtom(addingTagAtom);
  const { setHotkeyScopeAndMemorizePreviousScope } = usePreviousHotkeyScope();
  useScopedHotkeys(
    'c',
    () => {
      setAddingTag({
        isGroup: false,
        type,
      });
      setHotkeyScopeAndMemorizePreviousScope(SettingsHotKeyScope.TagsFormRow);
    },
    SettingsHotKeyScope.TagsPage,
  );
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
      <Button
        disabled={addingTag !== null && !addingTag?.isGroup}
        onClick={() => {
          setAddingTag({
            isGroup: false,
            type,
          });
        }}
      >
        <IconPlus className="size-4" />
        Add Tag
        <Kbd>C</Kbd>
      </Button>
    </div>
  );
};
