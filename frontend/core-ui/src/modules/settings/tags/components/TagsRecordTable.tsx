import {
  RecordTable,
  RecordTableTree,
  useMultiQueryState,
} from 'erxes-ui';
import { ITag, useTags } from 'ui-modules';
import React from 'react';
import { useTagContext } from '@/settings/tags/providers/TagProvider';
import { tagsColumns } from './TagsColumns';

export const TagsRecordTable = () => {
  const { mode, targetGroupId } = useTagContext();
  const [queries] = useMultiQueryState<{
    searchValue: string;
  }>([ 'searchValue']);
  const { searchValue } = queries;
  const { tags, pageInfo, loading, handleFetchMore } = useTags({
    variables: {
      searchValue: searchValue ?? undefined,
    },
  });

  const transformedData = React.useMemo(() => {
    const result: ITag[] = [];

    if (mode === 'adding-tag' || mode === 'adding-group') {
      result.push({
        _id: 'new-item-temp',
        name: '',
        hasChildren: false,
        isGroup: mode === 'adding-group',
        colorCode: '',
        description: '',
      });
    }

    const existingTags = tags || [];
    
    if (existingTags.length === 0) {
      return result;
    }

    const tagsById = new Map<string, ITag>();
    const groups: ITag[] = [];
    const childrenByParent = new Map<string, ITag[]>();
    const standaloneTagsSet = new Set<string>();

    existingTags.forEach((tag) => {
      tagsById.set(tag._id, tag);
      
      if (tag.isGroup) {
        groups.push(tag);
      } else if (tag.parentId) {
        if (!childrenByParent.has(tag.parentId)) {
          childrenByParent.set(tag.parentId, []);
        }
        const parentChildren = childrenByParent.get(tag.parentId);
        if (parentChildren) {
          parentChildren.push(tag);
        }
      } else {
        standaloneTagsSet.add(tag._id);
      }
    });

    const sortByName = (a: ITag, b: ITag) => a.name.localeCompare(b.name);

    const standaloneTags = Array.from(standaloneTagsSet)
      .map(id => tagsById.get(id))
      .filter((tag): tag is ITag => tag !== undefined)
      .sort(sortByName);

    standaloneTags.forEach((tag) => {
      result.push({
        ...tag,
        hasChildren: false,
        order: tag.name,
      });
    });

    const sortedGroups = [...groups].sort(sortByName);
    
    sortedGroups.forEach((group) => {
      const children = childrenByParent.get(group._id) || [];
      
      result.push({
        ...group,
        hasChildren: children.length > 0,
        isGroup: true,
        order: group.name,
      });

      if (mode === 'adding-tag-to-group' && targetGroupId === group._id) {
        result.push({
          _id: 'new-item-temp',
          name: '',
          hasChildren: false,
          isGroup: false,
          colorCode: '',
          description: '',
          parentId: group._id,
          order: `${group.name}/new-item-temp`,
        });
      }

      const sortedChildren = [...children].sort(sortByName);
      sortedChildren.forEach((child) => {
        result.push({
          ...child,
          hasChildren: false,
          order: `${group.name}/${child.name}`,
        });
      });
    });

    return result;
  }, [tags, mode, targetGroupId]);


  return (
    <RecordTable.Provider
      columns={tagsColumns}
      data={transformedData}
      className="w-full [&_td:not(:last-child)]:border-r-0 [&_table]:w-full m-3"
      stickyColumns={['more', 'name']}
    >
      <RecordTableTree id="tags-list" ordered>
        <RecordTable.Scroll>
          <RecordTable>
            <RecordTable.Header />
            <RecordTable.Body>
              <RecordTable.RowList Row={RecordTableTree.Row} />
              {loading && <RecordTable.RowSkeleton rows={30} />}
              {!loading && pageInfo?.hasNextPage && (
                <RecordTable.RowSkeleton
                  rows={1}
                  handleInView={handleFetchMore}
                />
              )}
            </RecordTable.Body>
          </RecordTable>
        </RecordTable.Scroll>
      </RecordTableTree>
    </RecordTable.Provider>
  );
};
