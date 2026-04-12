import { DraftState, VisibleRow } from '@/settings/tags/types/tagTree';
import { ITag } from 'ui-modules';
import { useMemo } from 'react';

interface UseVisibleTagRowsParams {
  rootTags: ITag[];
  tagsByParentId: Record<string, ITag[]>;
  tagGroups: ITag[];
  expandedGroupIds: Set<string>;
  searchTerm: string;
  draft: DraftState | null;
}

const matchesSearch = (tag: ITag, normalized: string): boolean =>
  tag.name.toLowerCase().includes(normalized) ||
  (tag.description ?? '').toLowerCase().includes(normalized);

export const useVisibleTagRows = ({
  rootTags,
  tagsByParentId,
  tagGroups,
  expandedGroupIds,
  searchTerm,
  draft,
}: UseVisibleTagRowsParams): VisibleRow[] => {
  return useMemo(() => {
    const groupRoots = rootTags.filter((t) => t.isGroup);
    const standaloneRoots = rootTags.filter((t) => !t.isGroup);
    const rows: VisibleRow[] = [];

    // Root-level draft (group or tag) goes at the top
    if (draft && (draft.kind === 'group' || draft.kind === 'tag')) {
      rows.push({ rowType: 'draft', draft, depth: 0 });
    }

    if (searchTerm) {
      const normalized = searchTerm.toLowerCase();

      const matchedTagIds = new Set(
        rootTags
          .concat(Object.values(tagsByParentId).flat())
          .filter((t) => matchesSearch(t, normalized))
          .map((t) => t._id),
      );

      const contextGroupIds = new Set<string>();
      for (const group of tagGroups) {
        const children = tagsByParentId[group._id] ?? [];
        for (const child of children) {
          if (matchedTagIds.has(child._id)) {
            contextGroupIds.add(group._id);
            break;
          }
        }
      }

      // Groups
      for (const group of groupRoots) {
        const isDirectMatch = matchedTagIds.has(group._id);
        const isContextParent =
          contextGroupIds.has(group._id) && !isDirectMatch;
        const children = tagsByParentId[group._id] ?? [];
        const matchedChildren = children.filter((c) =>
          matchedTagIds.has(c._id),
        );

        if (!isDirectMatch && !isContextParent && matchedChildren.length === 0)
          continue;

        if (isContextParent) {
          rows.push({ rowType: 'context-group', tag: group, depth: 0, isContext: true });
        } else {
          rows.push({ rowType: 'group', tag: group, depth: 0 });
        }

        const childrenToShow = isDirectMatch ? children : matchedChildren;
        for (const child of childrenToShow) {
          rows.push({
            rowType: 'child-tag',
            tag: child,
            depth: 1,
            parentId: group._id,
            isContext: !matchedTagIds.has(child._id),
          });
        }
      }

      // Standalone tags
      for (const tag of standaloneRoots) {
        if (matchedTagIds.has(tag._id)) {
          rows.push({ rowType: 'tag', tag, depth: 0 });
        }
      }

      return rows;
    }

    // Normal mode (no search)
    for (const group of groupRoots) {
      rows.push({ rowType: 'group', tag: group, depth: 0 });

      if (expandedGroupIds.has(group._id)) {
        const children = tagsByParentId[group._id] ?? [];

        for (const child of children) {
          rows.push({
            rowType: 'child-tag',
            tag: child,
            depth: 1,
            parentId: group._id,
          });
        }

        if (draft?.kind === 'child-tag' && draft.parentId === group._id) {
          rows.push({ rowType: 'draft', draft, depth: 1 });
        }
      }
    }

    for (const tag of standaloneRoots) {
      rows.push({ rowType: 'tag', tag, depth: 0 });
    }

    return rows;
  }, [
    rootTags,
    tagsByParentId,
    tagGroups,
    expandedGroupIds,
    searchTerm,
    draft,
  ]);
};
