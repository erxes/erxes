import React, { useEffect } from 'react';
import { __ } from '@erxes/ui/src/utils';

import DataWithLoader from '@erxes/ui/src/components/DataWithLoader';

import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
import ListContainer from '../containers/switchboard/List';

type IProps = {
  queryParams: any;
  navigate: any;
  location: any;
};

function List(props: IProps) {
  const { navigate } = props;

  let routePath = 'callDashboard';
  useEffect(() => {
    switch (routePath) {
      default:
        <ListContainer navigate={navigate} location={location} />;
        break;
    }
  }, [routePath]);

  return (
    <Wrapper
      header={<Wrapper.Header title={__('Call Dashboard')} />}
      content={
        <DataWithLoader
          data={<ListContainer navigate={navigate} location={location} />}
          loading={false}
          count={1}
          emptyText={__('Theres no calls')}
          emptyImage="/images/actions/8.svg"
        />
      }
      hasBorder
    />
  );
}

export default List;
