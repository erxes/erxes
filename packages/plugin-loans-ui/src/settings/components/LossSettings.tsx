import {
  Button,
  HeaderDescription,
  MainStyleTitle as Title,
  Wrapper,
} from "@erxes/ui/src";
import React, { useState } from "react";

import { ContentBox } from "../styles";
import { IConfigsMap } from "../types";
import PerSettings from "./PerUndueBonus";
import Sidebar from "./Sidebar";
import { __ } from "coreui/utils";

function Header() {
  return (
    <HeaderDescription
      icon="/images/actions/25.svg"
      title={__("Loan not calc loss settings")}
      description=""
    />
  );
}

type Props = {
  save: (configsMap: IConfigsMap) => void;
  configsMap: IConfigsMap;
};

const GeneralSettings = (props: Props) => {
  const [configsMap, setConfigsMap] = useState<IConfigsMap>(props.configsMap);

  const add = (e) => {
    e.preventDefault();

    if (!configsMap.lossConfig) {
      configsMap.lossConfig = {};
    }

    // must save prev item saved then new item
    configsMap.lossConfig.newUndueConfig = {
      title: "New Loss Config",
      startDate: new Date(),
      endDate: new Date(),
      percent: 0,
    };

    setConfigsMap((prevConfigsMap) => ({
      ...prevConfigsMap,
      configsMap,
    }));
  };

  const deleteHandler = (currentConfigKey: string) => {
    delete configsMap.lossConfig[currentConfigKey];
    delete configsMap.lossConfig["newUndueConfig"];

    setConfigsMap(configsMap);
    props.save(configsMap);
  };

  const renderConfigs = (configs) => {
    return Object.keys(configs).map((key) => {
      return (
        <PerSettings
          key={`Loss${key}`}
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
    const configs = configsMap.lossConfig || {};

    return (
      <ContentBox id={"UndueSettingsMenu"}>{renderConfigs(configs)}</ContentBox>
    );
  };

  const breadcrumb = [
    { title: __("Settings"), link: "/settings" },
    { title: __("Loan config") },
  ];

  const actionButtons = (
    <Button btnStyle="primary" onClick={add} icon="plus" uppercase={false}>
      {__("New config")}
    </Button>
  );

  return (
    <Wrapper
      header={
        <Wrapper.Header title={__("Loss configs")} breadcrumb={breadcrumb} />
      }
      mainHead={<Header />}
      actionBar={
        <Wrapper.ActionBar
          left={<Title>{__("Loss configs")}</Title>}
          right={actionButtons}
        />
      }
      leftSidebar={<Sidebar />}
      content={renderContent()}
    />
  );
};

export default GeneralSettings;
