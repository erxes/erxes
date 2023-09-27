import { Wrapper, __ } from '@erxes/ui/src';
import React from 'react';
import BoxContainer from '../../containers/structure/Box';
import SettingsSideBar from '../../containers/common/SettingSideBar';

export default function Structure() {
  return (
    <Wrapper
      header={
        <Wrapper.Header
          title="Structure"
          breadcrumb={[
            { title: __('Settings'), link: '/settings' },
            { title: __('Structure') }
          ]}
        />
      }
      content={<BoxContainer />}
      leftSidebar={<SettingsSideBar />}
      hasBorder={true}
    />
  );
}
