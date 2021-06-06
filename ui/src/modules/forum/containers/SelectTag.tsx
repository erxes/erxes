import SelectWithSearch from 'erxes-ui/lib/components/SelectWithSearch';
import * as React from 'react';
import { queries } from '../graphql';

// get config options for react-select-plus
export function generateHerderOptions(array) {
  return array.map(item => {
    const forum = item || {};

    return {
      value: forum._id,
      label: forum.title
    };
  });
}

export default ({
  queryParams,
  onSelect,
  initialValue,
  multi = true,
  label,
  name
}: {
  queryParams?: string;
  label: string;
  onSelect: (values: string[] | string, name: string) => void;
  multi?: boolean;
  customOption?: string;
  initialValue?: string | string[];
  setParam?: boolean;
  name: string;
}) => {
  const defaultValue = queryParams ? queryParams[name] : initialValue;

  return (
    <SelectWithSearch
      showAvatar={false}
      label={label}
      queryName="forums"
      name={name}
      customQuery={queries.forums}
      initialValue={defaultValue}
      generateOptions={generateHerderOptions}
      onSelect={onSelect}
      multi={multi}
    />
  );
};
