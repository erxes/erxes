import { Button, DataWithLoader } from "@erxes/ui/src/components";
import { __, confirm } from "@erxes/ui/src/utils";

import { ContentBox } from "../styles";
import Header from "./Header";
import { IConfigsMap } from "../types";
import PerSettings from "./PerIncomeSettings";
import React from "react";
import Sidebar from "./Sidebar";
import { Title } from "@erxes/ui-settings/src/styles";
import { Wrapper } from "@erxes/ui/src/layout";

type Props = {
  save: (configsMap: IConfigsMap) => void;
  configsMap: IConfigsMap;
  loading: boolean;
};

type State = {
  configsMap: IConfigsMap;
};

class GeneralSettings extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      configsMap: props.configsMap,
    };
  }

  componentDidUpdate(prevProps: Readonly<Props>): void {
    if (prevProps.configsMap !== this.props.configsMap) {
      this.setState({ configsMap: this.props.configsMap || {} });
    }
  }

  add = (e) => {
    e.preventDefault();
    const { configsMap } = this.state;

    const newStageInIncomeConfig = { ...configsMap.stageInIncomeConfig };

    if (!configsMap.stageInIncomeConfig) {
      configsMap.stageInIncomeConfig = {};
    }

    // must save prev item saved then new item
    newStageInIncomeConfig.newStageInIncomeConfig = {
      title: "New Erkhet Income Config",
      boardId: "",
      pipelineId: "",
      stageId: "",
      userEmail: "",
    };

    this.setState({
      configsMap: {
        ...configsMap,
        stageInIncomeConfig: newStageInIncomeConfig,
      },
    });
  };

  delete = (currentConfigKey: string) => {
    confirm("This Action will delete this config are you sure?").then(() => {
      const { configsMap } = this.state;

      const stageInIncomeConfig = { ...configsMap.stageInIncomeConfig };
      delete stageInIncomeConfig[currentConfigKey];
      delete stageInIncomeConfig.newStageInIncomeConfig;

      this.setState({
        configsMap: { ...configsMap, stageInIncomeConfig },
      });

      this.props.save({ ...configsMap, stageInIncomeConfig });
    });
  };

  renderConfigs(configs) {
    return Object.keys(configs).map((key) => {
      return (
        <PerSettings
          key={key}
          configsMap={this.state.configsMap}
          config={configs[key]}
          currentConfigKey={key}
          save={this.props.save}
          delete={this.delete}
        />
      );
    });
  }

  renderContent() {
    const { configsMap } = this.state;
    const configs = configsMap.stageInIncomeConfig || {};

    return (
      <ContentBox id={"GeneralSettingsMenu"}>
        {this.renderConfigs(configs)}
      </ContentBox>
    );
  }

  render() {
    const configCount = Object.keys(
      this.state.configsMap.stageInIncomeConfig || {}
    ).length;

    const breadcrumb = [
      { title: __("Settings"), link: "/settings" },
      { title: __("Erkhet income config") },
    ];

    const actionButtons = (
      <Button
        btnStyle="success"
        onClick={this.add}
        icon="plus-circle"
        uppercase={false}
      >
        New config
      </Button>
    );

    return (
      <Wrapper
        header={
          <Wrapper.Header
            title={__("Erkhet income config")}
            breadcrumb={breadcrumb}
          />
        }
        mainHead={<Header />}
        actionBar={
          <Wrapper.ActionBar
            left={<Title>{__("Erkhet income configs")}</Title>}
            right={actionButtons}
          />
        }
        leftSidebar={<Sidebar />}
        content={
          <DataWithLoader
            data={this.renderContent()}
            loading={this.props.loading}
            count={configCount}
            emptyText={__("There is no config") + "."}
            emptyImage="/images/actions/8.svg"
          />
        }
        hasBorder={true}
        transparent={true}
      />
    );
  }
}

export default GeneralSettings;
