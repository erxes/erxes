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
import { Can, usePermissionCheck } from 'ui-modules';

export const TagAddButtons = ({ className }: { className?: string }) => {
  const [type] = useQueryState<string>('tagType');
  const [addingTag, setAddingTag] = useAtom(addingTagAtom);
  const { setHotkeyScopeAndMemorizePreviousScope } = usePreviousHotkeyScope();
  const { hasActionPermission } = usePermissionCheck();
  const canCreateTags = hasActionPermission('tagsCreate');
  useScopedHotkeys(
    'c',
    () => {
      if (!canCreateTags) return;
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
      <Can action="tagsCreate">
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
      </Can>
      <Can action="tagsCreate">
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
      </Can>
    </div>
  );
};
