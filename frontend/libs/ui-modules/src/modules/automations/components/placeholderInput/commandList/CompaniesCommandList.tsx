import { useCompanies } from 'ui-modules/modules/contacts/hooks/useCompanies';
import { GenericCommandList } from './GenericCommandList';
import { CompaniesInline } from 'ui-modules/modules/contacts';

export const CompaniesCommandList = ({
  searchValue,
  onSelect,
  selectField = '_id',
}: {
  searchValue: string;
  onSelect: (value: string) => void;
  selectField?: string;
}) => {
  const { companies, loading, handleFetchMore, totalCount } = useCompanies({
    variables: {
      searchValue: searchValue,
    },
  });
  return (
    <GenericCommandList
      heading="Companies"
      items={companies}
      loading={loading}
      totalCount={totalCount}
      handleFetchMore={handleFetchMore}
      onSelect={onSelect}
      getKey={(company) => company._id}
      renderItem={(company) => (
        <CompaniesInline
          companies={[
            {
              ...company,
            },
          ]}
          placeholder="Unnamed company"
        />
      )}
      // default selects _id; allow custom field like 'email'
      selectField={selectField}
    />
  );
};
