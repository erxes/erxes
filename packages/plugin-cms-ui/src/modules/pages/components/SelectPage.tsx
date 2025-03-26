import { gql, useQuery } from '@apollo/client';
import React from 'react';
import Select from 'react-select';
import { queries } from '../graphql';

const PAGES_QUERY = gql`
query CmsPages($clientPortalId: String, $searchValue: String) {
  cmsPages(clientPortalId: $clientPortalId, searchValue: $searchValue) {
    _id
    name
  }
}
`

type Props = {
  clientPortalId: string;
  value: string | string[];
  isMulti?: boolean;
  onChange: (value: string | string[]) => void;
};

const Container = (props: Props) => {
  const { value, onChange } = props;
  const [searchValue, setSearchValue] = React.useState<string>('');
  const [options, setOptions] = React.useState<any[]>([]);

  const { data, loading } = useQuery(PAGES_QUERY, {
    variables: {
      clientPortalId: props.clientPortalId,
      searchValue,
    },
  });

  React.useEffect(() => {
    if (data) {
      setOptions(
        data.cmsPages.map((page: any) => ({
          value: page._id,
          label: page.name,
        }))
      );
    }
  }, [data]);

  const handleInputChange = (newValue: string) => {
    setSearchValue(newValue); // Update the search value when user types
  };

  const handleChange = (selected: any) => {
   
    if (props.isMulti) {
      onChange(selected ? selected.map((item: any) => item.value) : []);
    } else {
      onChange(selected ? selected.value : '');
    }
  };

  return (
    <Select
      menuPortalTarget={document.body} // Render dropdown in a portal
      styles={{
        menuPortal: (base) => ({ ...base, zIndex: 9999 }), // Adjust z-index for the dropdown
      }}
      options={options}
      value={options.filter(option => 
        props.isMulti 
          ? Array.isArray(value) && value.includes(option.value) 
          : option.value === value
      )} 

      onChange={handleChange}
      onInputChange={handleInputChange}
      isMulti={props.isMulti}
      isLoading={loading}
    />
  );
};

export default Container;
