import React from 'react';
// erxes
import { __ } from '@erxes/ui/src/utils';
import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
// local
import Form from '../containers/discount/Form';
import { SUBMENU } from '../constants';

const DiscountEdit = () => {
  return (
    <Wrapper
      header={
        <Wrapper.Header title={__('Edit a Discount')} submenu={SUBMENU} />
      }
      content={<Form />}
      transparent
    />
  );
};

export default DiscountEdit;
