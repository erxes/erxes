import { __ } from '@erxes/ui/src/utils/core';
import React, { useEffect, useState } from 'react';
import Select from 'react-select-plus';

import { InsuranceCategory, Risk } from '../../../gql/types';

type Props = {
  loading?: boolean;
  filtered: InsuranceCategory[];
  allCategories: InsuranceCategory[];
  value: string | string[];
  onSearch: (value: string) => void;
  onChange: (categoryId: string, risks: Risk[]) => void;
};

const SelectCategory: React.FC<Props> = props => {
  const { filtered = [] } = props;

  const [searchValue, setSearchValue] = useState<string>('');
  const categories = filtered.length > 0 ? filtered : props.allCategories;

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

  const onChangeCategory = value => {
    const selected = categories.find(cat => cat._id === value.value);

    if (selected) {
      const risks = (selected.risks || []) as Risk[];
      props.onChange(value.value, risks);
    }
  };

  return (
    <>
      <Select
        placeholder={__('Type to search...')}
        value={props.value}
        defaultValue={props.value}
        onChange={onChangeCategory}
        isLoading={props.loading}
        onInputChange={onInputChange}
        options={categories.map(cat => ({
          value: cat._id,
          label: cat.name
        }))}
        multi={false}
      />
    </>
  );
};

export default SelectCategory;
