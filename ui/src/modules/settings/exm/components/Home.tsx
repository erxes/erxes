import React, { useState } from 'react';

import DataWithLoader from 'modules/common/components/DataWithLoader';
import HeaderDescription from 'modules/common/components/HeaderDescription';
import { Tabs, TabTitle } from 'modules/common/components/tabs';
import { __ } from '../../../common/utils';
import Wrapper from '../../../layout/components/Wrapper';
import Sidebar from '../containers/Sidebar';
import { TabContent } from 'modules/boards/styles/rightMenu';

type Props = {
  exm: any;
};

function Brands(props: Props) {
  const [currentTab, setCurrentTab] = useState('General');

  const breadcrumb = [
    { title: __('Settings'), link: '/settings' },
    { title: __('Exm'), link: '/settings/exm' },
    { title: props.exm.name }
  ];

  const leftActionBar = <div>{props.exm.name}</div>;

  const renderTabContent = () => {
    return <TabContent>This is {currentTab}</TabContent>;
  };

  const content = () => {
    return (
      <>
        <Tabs full={true}>
          <TabTitle
            className={currentTab === 'General' ? 'active' : ''}
            onClick={() => setCurrentTab('General')}
          >
            {__('General')}
          </TabTitle>
          <TabTitle
            className={currentTab === 'Appearance' ? 'active' : ''}
            onClick={() => setCurrentTab('Appearance')}
          >
            {__('Appearance')}
          </TabTitle>
          <TabTitle
            className={currentTab === 'Mobile App' ? 'active' : ''}
            onClick={() => setCurrentTab('Mobile App')}
          >
            {__('Mobile App')}
          </TabTitle>
          <TabTitle
            className={currentTab === 'Custom Stylesheet' ? 'active' : ''}
            onClick={() => setCurrentTab('Custom Stylesheet')}
          >
            {__('Custom Stylesheet')}
          </TabTitle>
        </Tabs>
        {renderTabContent()}
      </>
    );
  };

  return (
    <Wrapper
      header={<Wrapper.Header title={'Exm'} breadcrumb={breadcrumb} />}
      mainHead={
        <HeaderDescription
          icon="/images/actions/32.svg"
          title={'EXM'}
          description={__('')}
        />
      }
      actionBar={<Wrapper.ActionBar left={leftActionBar} />}
      leftSidebar={<Sidebar />}
      content={
        <DataWithLoader
          data={content()}
          emptyText="Add an integration in this Brand"
          emptyImage="/images/actions/2.svg"
          loading={false}
        />
      }
    />
  );
}

export default Brands;
