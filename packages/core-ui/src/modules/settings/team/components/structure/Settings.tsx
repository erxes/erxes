import { Wrapper, __ } from '@erxes/ui/src';
import React from 'react';
import BoxContainer from '../../containers/structure/Box';
import SettingsSideBar from '../common/SettingsSideBar';

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
    />
  );
}
