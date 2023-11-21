import React, { useState } from 'react';
import { TabTitle, Tabs } from '@erxes/ui/src/components/tabs';

import General from '../containers/General';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import { IExm } from '../types';
import { __ } from '@erxes/ui/src/utils';
import Appearance from '../containers/Appearance';

type Props = {
  exm: IExm;
  edit: (variables: IExm) => void;
  renderButton?: (props: IButtonMutateProps) => JSX.Element;
};

function EditFrom(props: Props) {
  const [currentTab, setCurrentTab] = useState('Mobile Gallery');

  const renderTabContent = () => {
    if (currentTab === 'Mobile Gallery') {
      return <General {...props} />;
    }

    return <Appearance {...props} />;
  };

  return (
    <>
      <Tabs full={true}>
        <TabTitle
          className={currentTab === 'Mobile Gallery' ? 'active' : ''}
          onClick={() => setCurrentTab('Mobile Gallery')}
        >
          {__('Mobile Gallery')}
        </TabTitle>
        <TabTitle
          className={currentTab === 'Web Appearance' ? 'active' : ''}
          onClick={() => setCurrentTab('Web Appearance')}
        >
          {__('Web Appearance')}
        </TabTitle>
      </Tabs>
      {renderTabContent()}
    </>
  );
}

export default EditFrom;
