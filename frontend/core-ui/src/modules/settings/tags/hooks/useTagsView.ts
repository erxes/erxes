import { useTagsContext } from '@/settings/tags/context/TagsContext';
import { useMultiQueryState } from 'erxes-ui';
import { useMemo } from 'react';
import { useGetTags } from 'ui-modules';
import { ITag } from 'ui-modules/modules/tags-new/types/Tag';

export type TagRowType =
  | 'group'
  | 'standalone'
  | 'child'
  | 'context-group'
  | 'draft';

export type TagTableRow = ITag & {
  rowType: TagRowType;
  hasChildren: boolean;
  order: string;
  isContext?: boolean;
};

const sortTags = (tags: ITag[]) =>
  [...tags].sort((a, b) => {
    if (Boolean(b.isGroup) !== Boolean(a.isGroup)) {
      return Number(Boolean(b.isGroup)) - Number(Boolean(a.isGroup));
    }

    return (a.name || '').localeCompare(b.name || '');
  });

export const useTagsView = () => {
  const { draft } = useTagsContext();
  const [{ tagType, searchValue }] = useMultiQueryState<{
    tagType: string;
    searchValue: string;
  }>(['tagType', 'searchValue']);

  const { tags = [], loading } = useGetTags({
    variables: {
      excludeWorkspaceTags: true,
      type: tagType || null,
    },
  });

  const rows = useMemo(() => {
    const normalizedSearch = (searchValue || '').trim().toLowerCase();
    const tagsById = new Map<string, ITag>();
    const childrenMap = new Map<string, ITag[]>();

    tags.forEach((tag: ITag) => {
      tagsById.set(tag._id, tag);

      if (tag.parentId) {
        childrenMap.set(tag.parentId, [
          ...(childrenMap.get(tag.parentId) || []),
          tag,
        ]);
      }
    });

    const matchesSearch = (tag: ITag) => {
      if (!normalizedSearch) return true;

      return [tag.name, tag.description]
        .filter(Boolean)
        .some((value) => value?.toLowerCase().includes(normalizedSearch));
    };

    const includedIds = new Set<string>();
    const contextGroupIds = new Set<string>();

    tags.forEach((tag: ITag) => {
      if (!matchesSearch(tag)) return;

      includedIds.add(tag._id);

      if (tag.parentId) {
        contextGroupIds.add(tag.parentId);
      }
    });

    const result: TagTableRow[] = [];

    const buildRows = (items: ITag[], parentOrder?: string) => {
      sortTags(items).forEach((tag, index) => {
        const order = parentOrder
          ? `${parentOrder}/${String(index + 1).padStart(4, '0')}`
          : String(index + 1).padStart(4, '0');

        const children = childrenMap.get(tag._id) || [];
        const shouldInclude =
          !normalizedSearch ||
          includedIds.has(tag._id) ||
          contextGroupIds.has(tag._id);

        if (shouldInclude) {
          result.push({
            ...tag,
            rowType: tag.isGroup
              ? contextGroupIds.has(tag._id) && !includedIds.has(tag._id)
                ? 'context-group'
                : 'group'
              : tag.parentId
                ? 'child'
                : 'standalone',
            hasChildren: children.length > 0,
            order,
            isContext:
              contextGroupIds.has(tag._id) && !includedIds.has(tag._id),
          });
        }

        if (children.length > 0) {
          buildRows(children, order);
        }
      });
    };

    const rootTags = tags.filter((tag: ITag) => !tag.parentId);
    buildRows(rootTags);

    if (draft) {
      const parentRow = draft.parentId
        ? result.find((row) => row._id === draft.parentId)
        : undefined;
      const draftOrder = parentRow ? `${parentRow.order}/0000` : '0000';

      result.push({
        _id: draft._id,
        name: draft.name,
        description: draft.description,
        type: tagType || null,
        colorCode: draft.colorCode,
        parentId: draft.parentId,
        isGroup: draft.kind === 'group',
        rowType: 'draft',
        hasChildren: false,
        order: draftOrder,
      });
    }

    return result.sort((a, b) => a.order.localeCompare(b.order));
  }, [draft, searchValue, tagType, tags]);

  const tagGroups = useMemo(
    () =>
      rows.filter(
        (row) =>
          (row.rowType === 'group' || row.rowType === 'context-group') &&
          row._id !== draft?._id,
      ),
    [draft?._id, rows],
  );

  return {
    rows,
    tagGroups,
    loading,
    type: tagType || null,
    searchValue: searchValue || '',
  };
};
