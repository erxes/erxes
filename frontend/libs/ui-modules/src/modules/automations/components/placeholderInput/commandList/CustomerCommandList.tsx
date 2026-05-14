import { useCustomers } from 'ui-modules/modules/contacts/hooks/useCustomers';
import { GenericCommandList } from './GenericCommandList';
import { CustomersInline } from 'ui-modules/modules/contacts';

export const CustomerCommandList = ({
  searchValue,
  onSelect,
  selectField = '_id',
}: {
  searchValue: string;
  onSelect: (value: string) => void;
  selectField?: string;
}) => {
  const { customers, loading, handleFetchMore, totalCount } = useCustomers({
    variables: {
      searchValue: searchValue,
    },
  });
  return (
    <GenericCommandList
      heading="Customers"
      items={customers}
      loading={loading}
      totalCount={totalCount}
      handleFetchMore={handleFetchMore}
      onSelect={onSelect}
      getKey={(customer) => customer._id}
      renderItem={(customer) => (
        <CustomersInline
          customers={[
            {
              ...customer,
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
