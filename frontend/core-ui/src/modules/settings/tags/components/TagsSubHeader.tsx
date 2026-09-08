import { useTagsContext } from '@/settings/tags/context/TagsContext';
import { TAG_DEFAULT_COLORS } from '@/settings/tags/constants/Colors';
import { SettingsHotKeyScope } from '@/types/SettingsHotKeyScope';
import { IconPlus, IconSearch } from '@tabler/icons-react';
import {
  Button,
  Filter,
  Input,
  Kbd,
  PageSubHeader,
  useMultiQueryState,
  usePreviousHotkeyScope,
  useScopedHotkeys,
} from 'erxes-ui';
import { Can, usePermissionCheck } from 'ui-modules';

const FIRST_TAG_COLOR = Object.values(TAG_DEFAULT_COLORS)[0];

export const TagsSubHeader = () => {
  const { draft, openDraft } = useTagsContext();
  const { hasActionPermission } = usePermissionCheck();
  const { setHotkeyScopeAndMemorizePreviousScope } = usePreviousHotkeyScope();
  const canCreateTags = hasActionPermission('tagsCreate');
  const [{ searchValue }, setQueryState] = useMultiQueryState<{
    searchValue: string;
  }>(['searchValue']);

  const handleOpenDraft = (kind: 'group' | 'standalone') => {
    openDraft({
      kind,
      colorCode: FIRST_TAG_COLOR,
      parentId: undefined,
    });
    setHotkeyScopeAndMemorizePreviousScope(SettingsHotKeyScope.TagsFormRow);
  };

  useScopedHotkeys(
    'c',
    () => {
      if (!canCreateTags || draft) return;
      handleOpenDraft('standalone');
    },
    SettingsHotKeyScope.TagsPage,
  );

  return (
    <Filter id="tags-filter">
      <PageSubHeader className="flex flex-wrap items-center gap-3 px-3 md:px-4">
        <div className="relative min-w-[240px] max-w-xl flex-1">
          <IconSearch className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchValue || ''}
            onChange={(event) =>
              setQueryState({
                searchValue: event.currentTarget.value || null,
              })
            }
            placeholder="Search tags"
            className="pl-9"
          />
        </div>
        <div className="ml-auto flex gap-2">
          <Can action="tagsCreate">
            <Button
              variant="outline"
              disabled={Boolean(draft)}
              onClick={() => handleOpenDraft('group')}
            >
              Add Group
            </Button>
          </Can>
          <Can action="tagsCreate">
            <Button
              disabled={Boolean(draft)}
              onClick={() => handleOpenDraft('standalone')}
            >
              <IconPlus className="size-4" />
              Add Tag
              <Kbd>C</Kbd>
            </Button>
          </Can>
        </div>
      </PageSubHeader>
    </Filter>
  );
};
