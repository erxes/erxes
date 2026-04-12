import { TagsHeader } from '@/settings/tags/components/TagsHeader';
import { TagsCommandBar } from '@/settings/tags/components/TagsCommandBar';
import { TagsToolbar } from '@/settings/tags/components/TagsToolbar';
import { TagTreeRow } from '@/settings/tags/components/TagTreeRow';
import { TagTreeTableHeader } from '@/settings/tags/components/TagTreeTableHeader';
import { useTagsPageState } from '@/settings/tags/hooks/useTagsPageState';
import { useVisibleTagRows } from '@/settings/tags/hooks/useVisibleTagRows';
import { IconTagOff } from '@tabler/icons-react';
import { ScrollArea, Skeleton, useQueryState } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { useGetTags, useTagAdd } from 'ui-modules';

export const TagsTreeTable = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'tags' });
  const [type] = useQueryState<string>('tagType');
  const { addTag } = useTagAdd();

  const { rootTags, tags, tagsByParentId, tagGroups, loading } = useGetTags({
    variables: {
      excludeWorkspaceTags: true,
      type: type,
    },
  });

  const {
    expandedGroupIds,
    searchTerm,
    setSearchTerm,
    activeFilter,
    setActiveFilter,
    draft,
    startDraft,
    cancelDraft,
    selectedIds,
    toggleExpand,
    toggleSelect,
    selectAll,
    clearSelection,
    selectionCapability,
  } = useTagsPageState(tags ?? []);

  const visibleRows = useVisibleTagRows({
    rootTags: rootTags ?? [],
    tagsByParentId: tagsByParentId ?? {},
    tagGroups: tagGroups ?? [],
    expandedGroupIds,
    searchTerm,
    activeFilter,
    draft,
  });

  const handleDraftSave = (name: string, description: string) => {
    if (!draft) return;
    addTag({
      variables: {
        name,
        description: description || undefined,
        colorCode: draft.colorCode,
        type: type,
        isGroup: draft.kind === 'group',
        parentId: draft.parentId ?? undefined,
      },
    });
    cancelDraft();
  };

  // Select all non-group, non-context tags
  const selectableTags = (tags ?? []).filter((t) => !t.isGroup);
  const allSelected =
    selectableTags.length > 0 &&
    selectableTags.every((t) => selectedIds.has(t._id));
  const someSelected = !allSelected && selectedIds.size > 0;

  const handleToggleAll = () => {
    if (allSelected) {
      clearSelection();
    } else {
      selectAll(selectableTags.map((t) => t._id));
    }
  };

  return (
    <div className="bg-sidebar p-2 rounded-lg basis-full m-3 grow-0 overflow-hidden flex flex-col">
      <TagsHeader
        draft={draft}
        onAddGroup={() => startDraft('group')}
        onAddTag={() => startDraft('tag')}
      />

      <TagsToolbar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
      />

      <TagTreeTableHeader
        allSelected={allSelected}
        someSelected={someSelected}
        onToggleAll={handleToggleAll}
      />

      <div className="pb-7 h-full overflow-hidden">
        <ScrollArea className="h-full shadow-xs rounded-lg [&>div>div]:last:mb-10 relative">
          {loading ? (
            Array.from({ length: 10 }).map((_, i) => (
              <div
                key={i}
                className="h-10 w-full shadow-xs flex items-center pr-12 pl-14 bg-background"
              >
                <div className="w-10 shrink-0" />
                <div className="flex-1 flex items-center gap-2">
                  <Skeleton className="size-3 rounded-full" />
                  <Skeleton className="h-4 w-32" />
                </div>
                <Skeleton className="h-4 w-48 max-md:hidden ml-2" />
                <Skeleton className="h-4 w-20 max-sm:hidden ml-2" />
              </div>
            ))
          ) : visibleRows.length === 0 && !draft ? (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col gap-3 text-muted-foreground items-center justify-center opacity-50 select-none">
              <IconTagOff className="size-16" strokeWidth={1} />
              <span className="font-medium text-lg">{t('not-found')}</span>
            </div>
          ) : (
            visibleRows.map((row, index) => {
              const key =
                row.rowType === 'draft'
                  ? `draft-${row.draft.kind}-${row.draft.parentId ?? ''}`
                  : `${row.rowType}-${row.tag._id}`;

              const tag = row.rowType !== 'draft' ? row.tag : null;
              const isSelected = tag ? selectedIds.has(tag._id) : false;
              const isExpanded = tag ? expandedGroupIds.has(tag._id) : false;
              const hasChildren = tag
                ? (tagsByParentId?.[tag._id]?.length ?? 0) > 0
                : false;

              return (
                <TagTreeRow
                  key={key}
                  row={row}
                  isSelected={isSelected}
                  isExpanded={isExpanded}
                  hasChildren={hasChildren}
                  tagGroups={tagGroups ?? []}
                  tagsByParentId={tagsByParentId ?? {}}
                  onToggleSelect={toggleSelect}
                  onToggleExpand={toggleExpand}
                  onAddChild={(parentId) => startDraft('child-tag', parentId)}
                  onDraftSave={handleDraftSave}
                  onDraftCancel={cancelDraft}
                />
              );
            })
          )}
        </ScrollArea>
      </div>

      <TagsCommandBar
        selectedIds={selectedIds}
        tags={tags ?? []}
        tagGroups={tagGroups ?? []}
        capability={selectionCapability}
        onClearSelection={clearSelection}
      />
    </div>
  );
};
