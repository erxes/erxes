import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { BarItems, PageHeader } from '@erxes/ui/src';
import { Tabs, TabTitle } from '@erxes/ui/src/components/tabs';
import { __ } from '@erxes/ui/src/utils';
import General from '../containers/General';
import Appearance from './Appearance';
import { IExm } from '../types';
import Button from '@erxes/ui/src/components/Button';
import { IButtonMutateProps } from '@erxes/ui/src/types';

type Props = {
  exm?: IExm;
  actionMutation: (variables: IExm, id?: string) => void;
  renderButton: (props: IButtonMutateProps) => JSX.Element;
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
      <PageHeader>
        <BarItems>
          <Link to={`/erxes-plugin-exm/home`}>
            <Button icon="leftarrow-3" btnStyle="link">
              {__('Back')}
            </Button>
          </Link>
        </BarItems>
      </PageHeader>
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
