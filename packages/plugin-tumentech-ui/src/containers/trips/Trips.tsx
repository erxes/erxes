import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
import { __ } from '@erxes/ui/src/utils/core';
import React from 'react';
import { tumentechMenu } from '../../components/list/CarsList';
import Trips from '../../components/trips/Trips';

type Props = {
  queryParams: any;
};

export default function TripsContainer(props: Props) {
  return (
    <Wrapper
      header={
        <Wrapper.Header
          title={__('Trips')}
          queryParams={props.queryParams}
          submenu={tumentechMenu}
        />
      }
      actionBar={<></>}
      footer={<></>}
      content={<Trips {...props} />}
    />
  );
}
