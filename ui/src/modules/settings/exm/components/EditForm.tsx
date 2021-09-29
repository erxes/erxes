import React, { useState } from 'react';
import { Tabs, TabTitle } from 'modules/common/components/tabs';
import { __ } from '../../../common/utils';
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

    return <Appearance />;
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
