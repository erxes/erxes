import { __ } from '@erxes/ui/src/utils/core';
import React, { useEffect, useState } from 'react';
import Select from 'react-select-plus';

import { ICategory } from '@erxes/ui/src/utils/categories';

type Props = {
  loading?: boolean;
  filtered: ICategory[];
  allCategories: ICategory[];
  value: string | string[];
  onSearch: (value: string) => void;
  onChange: (value: string) => void;
};

const SelectTags: React.FC<Props> = props => {
  const { filtered = [] } = props;

  const [searchValue, setSearchValue] = useState<string>('');

  useEffect(() => {
    let timeoutId: any = null;

    if (searchValue) {
      timeoutId = setTimeout(() => {
        props.onSearch(searchValue);
      }, 500);

      return () => {
        clearTimeout(timeoutId);
      };
    }
  }, [searchValue]);

  const onInputChange = value => {
    setSearchValue(value);
  };

  const onChangeTag = (value: string) => {
    props.onChange(value);
  };

  const tags = filtered.length > 0 ? filtered : props.allCategories;

  return (
    <>
      <Select
        placeholder={__('Type to search...')}
        value={props.value}
        defaultValue={props.value}
        onChange={onChangeTag}
        isLoading={props.loading}
        onInputChange={onInputChange}
        options={tags.map(tag => ({
          value: tag._id,
          label: tag.name
        }))}
        multi={false}
      />
    </>
  );
};

export default SelectTags;
