import { Wrapper, __ } from '@erxes/ui/src';

import BoxContainer from '../../containers/structure/Box';
import LeftSidebar from '@erxes/ui/src/layout/components/Sidebar';
import React from 'react';
import SettingsSideBar from '../../containers/common/SettingSideBar';
import SidebarHeader from '@erxes/ui-settings/src/common/components/SidebarHeader';

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
      leftSidebar={
        <LeftSidebar header={<SidebarHeader />} hasBorder={true}>
          <SettingsSideBar />
        </LeftSidebar>
      }
      hasBorder={true}
    />
  );
}
