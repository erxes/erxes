import { addingTagAtom } from '@/settings/tags/states/addingTagAtom';
import { SettingsHotKeyScope } from '@/types/SettingsHotKeyScope';
import { IconPlus } from '@tabler/icons-react';
import {
  Button,
  cn,
  Kbd,
  usePreviousHotkeyScope,
  useQueryState,
  useScopedHotkeys,
} from 'erxes-ui';
import { useAtom } from 'jotai';

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
