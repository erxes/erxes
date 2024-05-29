import React from 'react';
import { TabTitle, Tabs } from '@erxes/ui/src/components/tabs';
import { __ } from '@erxes/ui/src/utils';
import Icon from '@erxes/ui/src/components/Icon';

type Props = {
  domains: any[];
  loading?: boolean;
};

const Domain = (props: Props) => {
  const { domains } = props;
  const [currentTab, setCurrentTab] = React.useState(0);

  const renderContent = () => {
    return <>{`this is content of ${currentTab}`}</>;
  };

  const renderTabs = () => {
    return (
      <>
        <Tabs full={true}>
          {domains.map((domain, index) => (
            <TabTitle
              className={currentTab === index ? 'active' : ''}
              onClick={() => {
                setCurrentTab(index);
              }}
            >
              <Icon
                icon='shield-check'
                color={
                  domain.verificationStatus === 'Complete' &&
                  domain.authenticationStatus === 'Authenticated'
                    ? 'green'
                    : 'grey'
                }
              />
              {domain.sendingDomain}
            </TabTitle>
          ))}
        </Tabs>

        {renderContent()}
      </>
    );
  };

  return renderTabs();
};

export default Domain;
