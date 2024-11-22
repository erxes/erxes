import { useQuery } from '@apollo/client';
import React from 'react';
import Select from 'react-select';
import { queries } from '../graphql';

type Props = {
  clientPortalId: string;
  value: string | string[];
  isMulti?: boolean;
  onChange: (categoryId: string) => void;
};

const Container = (props: Props) => {
  console.log("props", props)
  const { value, onChange } = props;
  const [searchValue, setSearchValue] = React.useState<string>('');
  const [options, setOptions] = React.useState<any[]>([]);

  const { data, loading } = useQuery(queries.GET_TAGS, {
    variables: {
      clientPortalId: props.clientPortalId,
      searchValue: '',
    },
  });

  React.useEffect(() => {
    if (data) {
      setOptions(
        data.cmsTags.map((tag: any) => ({
          value: tag._id,
          label: tag.name,
        }))
      );
    }
  }, [data, props.value]);

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
