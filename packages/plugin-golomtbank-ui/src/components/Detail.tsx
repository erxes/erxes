import { Tabs, TabTitle } from "@erxes/ui/src/components/tabs";
import { __ } from "@erxes/ui/src/utils/core";
import React from "react";
import { Content } from "../styles";
import DetailContainer from "../corporateGateway/accounts/containers/Detail";

import TransactionsContainer from "../corporateGateway/transactions/containers/List";
type Props = {
  loading?: boolean;
  queryParams: any;
};

const Detail = (props: Props) => {
  const { queryParams } = props;

  const serviceTypes = ["account", "transactions"];

  const [currentTab, setCurrentTab] = React.useState<string>(serviceTypes[0]);

  const tabOnClick = (tab: string) => {
    setCurrentTab(tab);
  };

  const renderContent = () => {
    if (currentTab === "account") {
      return (
        <Content>
          <DetailContainer {...props} queryParams={queryParams} />
        </Content>
      );
    }

    if (currentTab === "transactions") {
      return (
        <Content>
          <TransactionsContainer {...props} queryParams={queryParams} />
        </Content>
      );
    }

    return <>{currentTab}</>;
  };

  const renderTabs = () => {
    if (!queryParams.account) {
      return <>please select corporate gateway</>;
    }

    return (
      <>
        <Tabs full={true}>
          {Object.values(serviceTypes).map((type) => (
            <TabTitle
              key={type}
              className={currentTab === type ? "active" : ""}
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
