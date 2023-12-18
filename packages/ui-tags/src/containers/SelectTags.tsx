import { IOption, IQueryParams } from '@erxes/ui/src/types';

import { ITag } from '../types';
import React from 'react';
import SelectWithSearch from '@erxes/ui/src/components/SelectWithSearch';
import { queries } from '../graphql';

// get config options for react-select-plus
export function generateTagOptions(array: ITag[] = []): IOption[] {
  return array.map(item => {
    const tag = item || ({} as ITag);

    const foundedString = (tag.order || '').match(/[/]/gi);

    let space = '';

    if (foundedString) {
      space = '\u00A0 \u00A0'.repeat(foundedString.length);
    }

    return {
      value: tag._id,
      label: `${space}${tag.name}`
    };
  });
}

export default ({
  tagsType,
  queryParams,
  onSelect,
  initialValue,
  multi = true,
  customOption,
  label,
  name
}: {
  tagsType: string;
  queryParams?: IQueryParams;
  label: string;
  onSelect: (values: string[] | string, name: string) => void;
  multi?: boolean;
  customOption?: IOption;
  initialValue?: string | string[];
  setParam?: boolean;
  name: string;
}) => {
  const defaultValue = queryParams ? queryParams[name] : initialValue;

  return (
    <SelectWithSearch
      showAvatar={false}
      label={label}
      queryName="tags"
      name={name}
      customQuery={queries.tags}
      initialValue={defaultValue}
      generateOptions={generateTagOptions}
      onSelect={onSelect}
      multi={multi}
      customOption={customOption}
      filterParams={{ type: tagsType }}
    />
  );
};
