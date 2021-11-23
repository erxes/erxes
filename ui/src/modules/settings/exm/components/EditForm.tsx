import React, { useState } from 'react';
import { Tabs, TabTitle } from 'modules/common/components/tabs';
import { __ } from '../../../common/utils';
import General from '../containers/General';
import Appearance from './Appearance';
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
      </Tabs>
      {renderTabContent()}
    </>
  );
}

export default EditFrom;
