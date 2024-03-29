import React from 'react';

import SelectWithSearch from '@erxes/ui/src/components/SelectWithSearch';
import { IOption, IQueryParams } from '@erxes/ui/src/types';

const assetsQuery = `
    query assets($searchValue: String) {
        assets(searchValue: $searchValue) {
        _id
        name
        code
        order
        }
    }
`;

export const SelectWithAssets = ({
  label,
  name,
  queryParams,
  initialValue,
  multi,
  customOption,
  onSelect,
  skip,
  additionalOptions,
}: {
  queryParams?: IQueryParams;
  label: string;
  onSelect: (
    value: string[] | string,
    name: string,
    assetName?: string,
  ) => void;
  multi?: boolean;
  customOption?: IOption;
  initialValue?: string | string[];
  name: string;
  skip?: string[];
  additionalOptions?: IOption[];
}) => {
  const defaultValue = queryParams ? queryParams[name] : initialValue;

  const generateAssetOptions = (array: any[] = []): IOption[] => {
    let list: any[] = [];

    for (const item of array) {
      const asset = item || ({} as any);
      const order = asset.order;

      const foundedString = order.match(/[/]/gi);

      let space = '';

      if (foundedString) {
        space = '\u00A0 '.repeat(foundedString.length);
      }

      list.push({
        label: `${space} ${asset.code} - ${asset.name}`,
        extraValue: asset.name,
        value: asset._id,
      });
    }
    if (skip) {
      list = list.filter((item) => !skip.includes(item.value));
    }

    return list;
  };

  return (
    <SelectWithSearch
      label={label}
      queryName="assets"
      name={name}
      initialValue={defaultValue}
      generateOptions={generateAssetOptions}
      onSelect={onSelect}
      customQuery={assetsQuery}
      customOption={customOption}
      multi={multi}
      showAvatar={false}
    />
  );
};
