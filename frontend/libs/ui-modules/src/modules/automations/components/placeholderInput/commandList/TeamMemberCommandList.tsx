import { MembersInline, useUsers } from 'ui-modules/modules/team-members';
import { GenericCommandList } from './GenericCommandList';

export const TeamMemberCommandList = ({
  searchValue,
  onSelect,
  selectField = '_id',
}: {
  searchValue: string;
  onSelect: (value: string) => void;
  selectField?: string;
}) => {
  const { users, loading, handleFetchMore, totalCount } = useUsers({
    variables: {
      searchValue: searchValue,
    },
  });

  return (
    <GenericCommandList
      heading="Users"
      items={users || []}
      loading={loading}
      totalCount={totalCount}
      handleFetchMore={handleFetchMore}
      onSelect={onSelect}
      getKey={(user) => user._id}
      renderItem={(user) => (
        <MembersInline
          members={[
            {
              ...user,
            },
          ]}
          placeholder="Unnamed user"
        />
      )}
      // default selects _id; allow custom field like 'email'
      selectField={selectField}
    />
  );
};
