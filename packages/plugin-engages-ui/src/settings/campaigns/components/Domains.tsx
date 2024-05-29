import React from 'react';
import { TabTitle, Tabs } from '@erxes/ui/src/components/tabs';
import { __ } from '@erxes/ui/src/utils';

type Props = {
  domains: any[];
};

const Domain = (props: Props) => {
  const { domains } = props;
  const [currentTab, setCurrentTab] = React.useState(domains.length ?? 0);
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
