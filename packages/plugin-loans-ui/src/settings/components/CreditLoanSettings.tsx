import {
  Button,
  HeaderDescription,
  MainStyleTitle as Title,
  Wrapper
} from "@erxes/ui/src";
import React, { useState } from "react";

import { ContentBox } from "../styles";
import { IConfigsMap } from "../types";
import CreditScore from "./CreditScore";
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

    if (!configsMap.creditScore) {
      configsMap.creditScore = {};
    }

    // must save prev item saved then new item
    configsMap.creditScore.newCreditConfig = {
      title: "New Credit Config",
      startScore: 0,
      endScore: 0,
      amount: 0
    };

    let newConfig = JSON.parse(JSON.stringify(configsMap));

    setConfigsMap({ ...newConfig });
  };

  const deleteHandler = (currentConfigKey: string) => {
    delete configsMap.creditScore[currentConfigKey];
    delete configsMap.creditScore["newCreditConfig"];

    setConfigsMap(configsMap);
    props.save(configsMap);
  };

  const renderConfigs = (configs) => {
    return Object.keys(configs).map((key) => {
      return (
        <CreditScore
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
    const configs = configsMap.creditScore || {};

    return (
      <ContentBox id={"UndueSettingsMenu"}>{renderConfigs(configs)}</ContentBox>
    );
  };

  const breadcrumb = [
    { title: __("Settings"), link: "/settings" },
    { title: __("Credit configs") }
  ];

  const actionButtons = (
    <Button btnStyle="primary" onClick={add} icon="plus" uppercase={false}>
      {__("New config")}
    </Button>
  );

  return (
    <Wrapper
      header={
        <Wrapper.Header title={__("Credit configs")} breadcrumb={breadcrumb} />
      }
      mainHead={<Header />}
      actionBar={
        <Wrapper.ActionBar
          left={<Title>{__("Credit configs")}</Title>}
          right={actionButtons}
        />
      }
      leftSidebar={<Sidebar />}
      content={renderContent()}
    />
  );
};

export default GeneralSettings;
