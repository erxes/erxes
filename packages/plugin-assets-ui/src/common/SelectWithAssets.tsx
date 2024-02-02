import React from 'react';
import { SelectWithAssets } from './utils';

type Props = {
  onSelect: (value: string | string[], name: string) => void;
  value: string;
};

const SelectWithAssetOnProperties = (props: Props) => {
  const { onSelect, value } = props;

  return (
    <SelectWithAssets
      label="Choose Asset"
      name="assets"
      multi={false}
      initialValue={value}
      onSelect={onSelect}
      customOption={{ value: '', label: 'Choose Asset' }}
    />
  );
};

export default SelectWithAssetOnProperties;
