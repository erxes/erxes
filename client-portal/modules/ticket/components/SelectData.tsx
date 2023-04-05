import React, { useState } from 'react';

import Select from 'react-select-plus';
import { generateTree } from '../../../utils';
import { IOption } from '../../types';

type Props = {
  value: string;
  label: string;
  departments?: string[];
  branches?: string[];
  products?: string[];
  onSelect: (name: string) => void;
};

export default function SelectData({
  value,
  departments,
  label,
  branches,
  products,
  onSelect
}: Props) {
  const onChange = (option: IOption) => {
    const selectedValue = option?.value ? option?.value : '';
    onSelect(selectedValue);
  };

  if (products) {
    return (
      <Select
        placeholder={label}
        value={value}
        onChange={onChange}
        options={products.map((item: any) => ({
          value: item._id,
          label: item.name
        }))}
        multi={false}
      />
    );
  }

  return (
    <Select
      placeholder={label}
      value={value}
      onChange={onChange}
      options={generateTree(departments || branches, null, (node, level) => ({
        value: node._id,
        label: `${'---'.repeat(level)} ${node.title}`
      }))}
      multi={false}
    />
  );
}
