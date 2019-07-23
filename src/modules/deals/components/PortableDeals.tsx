import PortableItems from 'modules/boards/containers/portable/Items';
import React from 'react';
import options from '../options';

type IProps = {
  customerIds?: string[];
  companyIds?: string[];
  isOpen?: boolean;
};

export default (props: IProps) => {
  return <PortableItems options={options} {...props} />;
};
