import { Tabs, TabTitle } from '@erxes/ui/src/components/tabs';
import { IRouterProps } from '@erxes/ui/src/types';
import { __ } from '@erxes/ui/src/utils/core';
import React from 'react';
import { Content } from '../../../styles';
import DetailContainer from '../accounts/containers/Detail';
import TransactionsContainer from '../transactions/containers/List';

type Props = {
  history?: any;
  loading?: boolean;
  queryParams: any;
} & IRouterProps;

const Detail = (props: Props) => {
  const { queryParams } = props;

  const serviceTypes = ['account', 'transactions'];

  const [currentTab, setCurrentTab] = React.useState<string>(serviceTypes[0]);

  const tabOnClick = (tab: string) => {
    setCurrentTab(tab);
  };

  const renderContent = () => {
    if (currentTab === 'account') {
      return (
        <Content>
          <DetailContainer {...props} queryParams={queryParams} />
        </Content>
      );
    }

    if (currentTab === 'transactions') {
      return (
        <Content>
          <TransactionsContainer {...props} queryParams={queryParams} />
        </Content>
      );
    }

    return <>{currentTab}</>;
  };

  const renderTabs = () => {
    if (!queryParams._id) {
      return <>please select corporate gateway</>;
    }

    if (!queryParams._id || !queryParams.account) {
      return <>please select account</>;
    }

    return (
      <>
        <Tabs full={true}>
          {Object.values(serviceTypes).map((type, index) => (
            <TabTitle
              key={index}
              className={currentTab === type ? 'active' : ''}
              onClick={() => tabOnClick(type)}
            >
              {__(type)}
            </TabTitle>
          ))}
        </Tabs>
        {renderContent()}
      </>
    );
  };

  return renderTabs();
};

export default Detail;
