import { __ } from '@erxes/ui/src/utils';
import React from 'react';
import { Wrapper } from '@erxes/ui/src/layout';
import SideBar from './SideBar';
import { DataWithLoader } from '@erxes/ui/src/components';
import { menuDynamic } from '../constants';

type Props = {
  history: any;
  queryParams: any;
};

const SyncHistoryList = ({ history, queryParams }: Props) => {
  return (
    <Wrapper
      header={
        <Wrapper.Header
          title={__('Sync Histories')}
          queryParams={queryParams}
          submenu={menuDynamic}
        />
      }
      leftSidebar={<SideBar />}
      content={
        <DataWithLoader
          data={<>history</>}
          loading={false}
          count={0}
          emptyImage="/images/actions/1.svg"
        />
      }
      transparent={true}
      hasBorder={true}
    />
  );
};

export default SyncHistoryList;
