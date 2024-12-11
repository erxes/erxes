
import SelectWithSearch from '@erxes/ui/src/components/SelectWithSearch';
import { IOption, IQueryParams } from '@erxes/ui/src/types';
import React from 'react';

const QUERY = `query clientPortalGetConfigs($searchValue: String) {
    clientPortalGetConfigs(search: $searchValue) {
      _id
      domain
      name
      url
    }
  }`;

export default (props: {
  queryParams?: IQueryParams;
  filterParams?: {
    ids?: string[];
    status?: string;
    excludeIds?: boolean;
    isAssignee?: boolean;
    branchIds?: string[];
    departmentIds?: string[];
  };
  label: string;
  onSelect: (config:any) => void;
  multi?: boolean;
  withCustomStyle?: boolean;
  customOption?: IOption;
  customField?: string;
  initialValue?: string | string[];

  name: string;
}) => {
  const {
    queryParams,
    customOption,
    customField,
    initialValue,
    multi = true,
    label,
    filterParams,
    name,
    withCustomStyle,
  } = props;
  const defaultValue = queryParams ? queryParams[name] : initialValue;

  // get user options for react-select
  function generateOptions(array: any[] = []): IOption[] {
    return array.map((item) => {
      const cp = item;

      const generateLabel =
        (cp.name || 'Business Portal') 
        + '\t' + (cp.url || cp.domain);

      return {
        value: cp._id,
        label: generateLabel,
      };
    });
  }

  const customStyles = {
    menuPortal: (base) => ({ ...base, zIndex: 9999 }),
    menu: (base) => ({ ...base, zIndex: 9999 }),
    backgroundColor: (base) => ({ ...base, backgroundColor: 'red' }),
  };

  return (
    <SelectWithSearch
      label={label}
      queryName='clientPortalGetConfigs'
      name={name}
      filterParams={filterParams}
      initialValue={defaultValue}
      generateOptions={generateOptions}
      onSelect={props.onSelect}
      customQuery={QUERY}
      customOption={customOption}
      multi={multi}
      customStyles={withCustomStyle && customStyles}
      menuPortalTarget={withCustomStyle && document.body}
    />
  );
};
