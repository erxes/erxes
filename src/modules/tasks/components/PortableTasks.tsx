import { PortableItems } from 'modules/boards/containers';
import * as React from 'react';
import options from '../options';

type IProps = {
  customerIds?: string[];
  companyIds?: string[];
  isOpen?: boolean;
};

export default (props: IProps) => {
  return <PortableItems options={options} {...props} />;
};
