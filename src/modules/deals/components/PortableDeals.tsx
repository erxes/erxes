import PortableItems from 'modules/boards/containers/portable/Items';
import React from 'react';
import options from '../options';
import { IDeal } from '../types';

type IProps = {
  mainType?: string;
  mainTypeId?: string;
  onSelect: (items: IDeal[]) => void;
  isOpen?: boolean;
};

export default (props: IProps) => {
  return <PortableItems options={options} {...props} />;
};
