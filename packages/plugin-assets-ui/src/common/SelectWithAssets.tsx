import React from 'react';
import { SelectWithAssets } from './utils';

type Props = {
  onSelect: (value: string | string[], name: string) => void;
  value: string;
};

class SelectWithAssetOnProperties extends React.Component<Props> {
  constructor(props) {
    super(props);
  }

  render() {
    const { onSelect, value } = this.props;

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
  }
}

export default SelectWithAssetOnProperties;
