import { MainStyleTitle as Title } from "@erxes/ui/src/styles/eindex";
import { __ } from "@erxes/ui/src/utils";
import { Button } from "@erxes/ui/src/components";
import { Wrapper } from "@erxes/ui/src/layout";
import React, { useState } from "react";

import { ContentBox } from "../styles";
import { IConfigsMap } from "../types";
import Header from "./Header";
import PerSettings from "./GeneralPerSettings";
import Sidebar from "./SideBar";

type Props = {
  save: (configsMap: IConfigsMap) => void;
  configsMap: IConfigsMap;
};

type State = {
  configsMap: IConfigsMap;
};

const GeneralSettings = (props: Props) => {
  const [configsMap, setConfigsMap] = useState<IConfigsMap>(props.configsMap);

  const add = (e) => {
    e.preventDefault();

    if (!configsMap.erkhetConfig) {
      configsMap.erkhetConfig = {};
    }

    // must save prev item saved then new item
    const newBrandId = {
      title: "New Pms Config",
      brandId: "",
      apiKey: "",
      apiSecret: "",
      apiToken: "",
      costAccount: "",
      saleAccount: "",
      productCategoryCode: "",
      consumeDescription: "",
      customerDefaultName: "",
      customerCategoryCode: "",
      companyCategoryCode: "",
      debtAccounts: "",
      userEmail: "",
      defaultCustomer: ""
    };

    setConfigsMap((prevConfigsMap) => ({
      ...prevConfigsMap,
      erkhetConfig: {
        ...prevConfigsMap.erkhetConfig,
        newBrandId
      }
    }));
  };

  const deleteHandler = (currentConfigKey: string) => {
    delete configsMap.erkhetConfig[currentConfigKey];
    delete configsMap.erkhetConfig["newBrandId"];

    setConfigsMap(configsMap);

    props.save(configsMap);
  };

  const renderConfigs = (configs) => {
    return Object.keys(configs).map((key) => {
      return (
        <PerSettings
          key={key}
          configsMap={configsMap}
          config={configs[key]}
          currentConfigKey={key}
          save={props.save}
          delete={deleteHandler}
        />
      );
    });
  };

  const renderContent = () => {
    const configs = configsMap.erkhetConfig || {};

    return (
      <ContentBox id={"GeneralSettingsMenu"}>
        {renderConfigs(configs)}
      </ContentBox>
    );
  };

  const breadcrumb = [
    { title: __("Settings"), link: "/settings" },
    { title: __("Pms config") }
  ];

  const actionButtons = (
    <Button btnStyle="primary" onClick={add} icon="plus" uppercase={false}>
      New config
    </Button>
  );

  return (
    <Wrapper
      header={
        <Wrapper.Header title={__("Pms config")} breadcrumb={breadcrumb} />
      }
      mainHead={<Header />}
      actionBar={
        <Wrapper.ActionBar
          left={<Title>{__("Pms configs")}</Title>}
          right={actionButtons}
        />
      }
      leftSidebar={<Sidebar />}
      content={renderContent()}
      hasBorder={true}
      transparent={true}
    />
  );
};

export default GeneralSettings;
