import React from 'react';
// erxes
import { __ } from '@erxes/ui/src/utils';
import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
// local
import Form from '../containers/plan/Form';
import { SUBMENU } from '../constants';

const PlanEdit = () => {
  return (
    <Wrapper
      header={<Wrapper.Header title={__('Edit a Plan')} submenu={SUBMENU} />}
      content={<Form />}
      transparent
    />
  );
};

export default PlanEdit;
