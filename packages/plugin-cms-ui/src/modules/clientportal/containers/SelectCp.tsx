
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
  const initialRef = React.useRef(initialValue);

  // get user options for react-select
  const generateOptions = React.useCallback((array: any[] = []): IOption[] => {
    return array.map((item) => ({
      value: item._id,
      label: `${item.name || 'Business Portal'}\t${item.url || item.domain}`,
    }));
  }, []);

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
      initialValue={initialRef.current}
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
