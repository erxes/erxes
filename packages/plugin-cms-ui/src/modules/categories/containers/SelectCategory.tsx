import React from 'react';
import { gql, useQuery, useLazyQuery } from '@apollo/client';
import SelectCategory from '../components/SelectCategory';
import { queries } from '../graphql';
import Select from 'react-select';

type Props = {
  clientPortalId: string;
  value: string | string[];
  isMulti?: boolean;
  onChange: (categoryId: string) => void;
};

const Container = (props: Props) => {

  const { value, onChange } = props;
  const [searchValue, setSearchValue] = React.useState<string>('');
  const [options, setOptions] = React.useState<any[]>([]);

  const { data, loading } = useQuery(queries.GET_CATEGORIES, {
    variables: {
      clientPortalId: props.clientPortalId,
      searchValue: '',
    },
    skip: !searchValue,
  });

  React.useEffect(() => {
    if (data) {
      setOptions(
        data.cmsCategories.map((category: any) => ({
          value: category._id,
          label: category.name,
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
      defaultValue={value}
      // value={value}
      onChange={handleChange}
      onInputChange={handleInputChange}
      isMulti={props.isMulti}
      isLoading={loading}
    />
  );
};

export default Container;
