import React, { useState } from 'react';

import { Tabs, TabTitle } from 'modules/common/components/tabs';
import { __ } from '../../../common/utils';
import { TabContent } from 'modules/boards/styles/rightMenu';
import General from '../containers/General';
import Appearance from './Appearance';

type Props = {
  exm: any;
  edit: (variables: any) => void;
};

function EditFrom(props: Props) {
  const [currentTab, setCurrentTab] = useState('General');

  const { exm, edit } = props;

  const renderTabContent = () => {
    if (currentTab === 'General') {
      return <General exm={exm} edit={edit} />;
    }

    if (currentTab === 'Appearance') {
      return <Appearance />;
    }

    return <TabContent>This is {currentTab}</TabContent>;
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
}

export default EditFrom;
