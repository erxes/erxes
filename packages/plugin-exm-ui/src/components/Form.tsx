import React, { useState } from 'react';
import { Tabs, TabTitle } from '@erxes/ui/src/components/tabs';
import { __ } from '@erxes/ui/src/utils';
import General from '../containers/General';
import Appearance from './Appearance';
import { IExm } from '../types';

type Props = {
  exm?: IExm;
  actionMutation: (variables: IExm, id?: string) => void;
};

function Form(props: Props) {
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

export default Form;
