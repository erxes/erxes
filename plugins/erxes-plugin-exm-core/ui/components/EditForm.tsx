import React, { useState } from 'react';
import { Tabs, TabTitle } from 'erxes-ui/lib/components/tabs';
import { __ } from 'erxes-ui/lib/utils';
import General from '../containers/General';
import Appearance from './Appearance';
import ScoringConfig from './ScoringConfig';
import { IExm } from '../types';

type Props = {
  exm: IExm;
  edit: (variables: IExm) => void;
};

function EditFrom(props: Props) {
  const [currentTab, setCurrentTab] = useState('General');

  const renderTabContent = () => {
    if (currentTab === 'General') {
      return <General {...props} />;
    }

    if (currentTab === 'Scoring config') {
      return <ScoringConfig {...props} />;
    }

    return <Appearance {...props} />;
  };

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
          className={currentTab === 'Mobile App' ? 'active' : ''}
          onClick={() => setCurrentTab('Mobile App')}
        >
          {__('Mobile App')}
        </TabTitle>
        <TabTitle
          className={currentTab === 'Scoring config' ? 'active' : ''}
          onClick={() => setCurrentTab('Scoring config')}
        >
          {__('Scoring config')}
        </TabTitle>
      </Tabs>
      {renderTabContent()}
    </>
  );
}

export default EditFrom;
