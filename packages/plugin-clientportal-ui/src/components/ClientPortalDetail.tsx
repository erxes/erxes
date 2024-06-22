import { Tabs, TabTitle } from '@erxes/ui/src/components/tabs';
import { __ } from '@erxes/ui/src/utils/core';
import React, { useState } from 'react';

import { CONFIG_TYPES } from '../constants';
import { ClientPortalConfig } from '../types';
import Form from './Form';

type Props = {
  config: ClientPortalConfig;
  kind: 'client' | 'vendor';
  handleUpdate: (doc: ClientPortalConfig) => void;
};

const ClientPortalDetail: React.FC<Props> = ({
  config,
  kind,
  handleUpdate,
}: Props) => {
  const [currentTab, setCurrentTab] = useState('general');

  const tabOnClick = (currentTab: string) => {
    setCurrentTab(currentTab);
  };

  const renderContent = () => {
    const commonProps = {
      defaultConfigValues: config,
      handleUpdate,
    };

    const TYPE = CONFIG_TYPES[currentTab.toLocaleUpperCase()];

    return <Form {...commonProps} configType={TYPE.VALUE} />;
  };

  return (
    <>
      <Tabs full={true}>
        {Object.values(CONFIG_TYPES).map((type, index) => (
          <TabTitle
            key={index}
            className={currentTab === type.VALUE ? 'active' : ''}
            onClick={() => tabOnClick(type.VALUE)}
          >
            {__(type.LABEL)}
          </TabTitle>
        ))}
      </Tabs>
      {renderContent()}
    </>
  );
};

export default ClientPortalDetail;
