import React from 'react';
import { Wrapper } from '@erxes/ui/src';
import { __ } from '@erxes/ui/src/utils';

const SalesPlans = (): JSX.Element => {
  return (
    <>
      <Wrapper
        header={
          <Wrapper.Header
            title={__('Salesplans')}
            breadcrumb={[{ title: __('Salesplans') }]}
          />
        }
        content={<></>}
        actionBar={<Wrapper.ActionBar right={<></>} left={<></>} />}
      />
    </>
  );
};

export default SalesPlans;
