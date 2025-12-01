import {
  RecordTable,
  RecordTableTree,
  useMultiQueryState,
} from 'erxes-ui';
import React from 'react';
import { useTagContext } from 'ui-modules/modules/tags/components/TagProvider';
import { createTagsColumns } from './TagsColumns';
import { ITag } from 'ui-modules/modules/tags/types/Tag';
import { useTags } from 'ui-modules/modules/tags/hooks/useTags';

interface TagsRecordTableProps {
  tagType: string;
}

export const TagsRecordTable: React.FC<TagsRecordTableProps> = ({ tagType }) => {
  const { mode, targetGroupId } = useTagContext();
  const [queries] = useMultiQueryState<{
    searchValue: string;
  }>(['searchValue']);
  const { searchValue } = queries;
  const { tags, pageInfo, loading, handleFetchMore } = useTags({
    variables: {
      type: tagType,
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
        order: '',
      });
    }

    const existingTags = tags || [];

    if (existingTags.length === 0) {
      return result;
    }

    existingTags.forEach((tag) => {
      result.push({
        ...tag,
        hasChildren:
          existingTags.some((t) => t.parentId === tag._id) && tag.isGroup,
      });

      if (
        mode === 'adding-tag-to-group' &&
        targetGroupId === tag._id &&
        tag.isGroup
      ) {
        result.push({
          _id: 'new-item-temp',
          name: '',
          hasChildren: false,
          isGroup: false,
          colorCode: '',
          description: '',
          parentId: tag._id,
          order: `${tag.order}new-item-temp/`,
        });
      }
    });

    return result;
  }, [tags, mode, targetGroupId]);

  const tagsColumns = React.useMemo(() => createTagsColumns(tagType), [tagType]);

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
