import React, { useState } from 'react';
import Icon from '@erxes/ui/src/components/Icon';
import { Link } from 'react-router-dom';
import { MainContent, Wrapper } from '@erxes/ui/src/layout';
import { Tabs, TabTitle } from '@erxes/ui/src/components/tabs/index';
import { TabContent } from '@erxes/ui/src/styles/main';
import List from '../../containers/trips/List';

type Props = {
  queryParams: any;
};

const Trips = (props: Props) => {
  const [currentTab, setCurrentTab] = useState('list');
  const { queryParams } = props;

  const onClickTab = (type: string) => {
    setCurrentTab(type);
  };

  const renderTabContent = () => {
    if (currentTab === 'list') {
      return <List {...props} />;
    }

    return <></>;
  };

  const renderContent = () => {
    return (
      <>
        <Tabs full={true}>
          <TabTitle
            className={currentTab === 'list' ? 'active' : ''}
            onClick={() => onClickTab('list')}
          >
            Trip list
          </TabTitle>
          <TabTitle
            className={currentTab === 'map' ? 'active' : ''}
            onClick={() => onClickTab('map')}
          >
            Active trips
          </TabTitle>
        </Tabs>
        <TabContent>{renderTabContent()}</TabContent>
      </>
    );
  };

  return <MainContent>{renderContent()}</MainContent>;
};

export default Trips;
