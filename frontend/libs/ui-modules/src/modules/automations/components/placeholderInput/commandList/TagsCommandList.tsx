import { useTags } from 'ui-modules/modules/tags/hooks/useTags';
import { GenericCommandList } from './GenericCommandList';
import { SelectTagsItem } from 'ui-modules/modules/tags';

export const TagsCommandList = ({
  searchValue,
  onSelect,
  selectField = '_id',
}: {
  searchValue: string;
  onSelect: (value: string) => void;
  selectField?: string;
}) => {
  const { tags, loading, handleFetchMore, totalCount, error } = useTags({
    variables: {
      searchValue,
    },
  });
  return (
    <GenericCommandList
      heading="Tags"
      items={tags || []}
      loading={loading}
      totalCount={totalCount}
      handleFetchMore={handleFetchMore}
      onSelect={onSelect}
      getKey={(tag) => tag._id}
      renderItem={(tag) => <SelectTagsItem tag={tag} />}
      selectField={selectField}
    />
  );
};
