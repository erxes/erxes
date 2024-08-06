import {
  Button,
  EmptyState,
  HeaderDescription,
  Spinner
} from "@erxes/ui/src/components";
import React, { useEffect, useState } from "react";

import { ContentBox } from "../../styles";
import { FIELDS_GROUPS_CONTENT_TYPES } from "@erxes/ui-forms/src/settings/properties/constants";
import { IConfigsMap } from "../../types";
import { IFieldGroup } from "@erxes/ui-forms/src/settings/properties/types";
import PerSettings from "./PerSimilarityGroup";
import Sidebar from "./Sidebar";
import { Title } from "@erxes/ui-settings/src/styles";
import { Wrapper } from "@erxes/ui/src/layout";
import { __ } from "@erxes/ui/src/utils";
import client from "@erxes/ui/src/apolloClient";
import { queries as fieldQueries } from "@erxes/ui-forms/src/settings/properties/graphql";
import { gql } from "@apollo/client";
import { isEnabled } from "@erxes/ui/src/utils/core";

const GeneralSettings = ({ save, configsMap: initialConfigsMap, loading }) => {
  const [configsMap, setConfigsMap] = useState<IConfigsMap>(initialConfigsMap);
  const [fieldGroups, setFieldGroups] = useState<IFieldGroup[]>([]);

  useEffect(() => {
    client
      .query({
        query: gql(fieldQueries.fieldsGroups),
        variables: {
          contentType: FIELDS_GROUPS_CONTENT_TYPES.PRODUCT
        }
      })
      .then(({ data }) => {
        setFieldGroups(data ? data.fieldsGroups : [] || []);
      });
  }, []);

  useEffect(() => {
    setConfigsMap(initialConfigsMap);
  }, [initialConfigsMap]);

  const add = e => {
    e.preventDefault();
    setConfigsMap(prevConfigsMap => ({
      ...prevConfigsMap,
      similarityGroup: {
        ...prevConfigsMap.similarityGroup,
        newSimilarityGroup: {
          title: "New similiraty group",
          codeMask: "",
          rules: []
        }
      }
    }));
  };

  const deleteConfig = currentConfigKey => {
    const similarityGroup = { ...configsMap.similarityGroup };
    delete similarityGroup[currentConfigKey];
    delete similarityGroup["newSimilarityGroup"];

    const newMap = { ...configsMap, similarityGroup };
    setConfigsMap(newMap);
    save(newMap);
  };

  const renderConfigs = configs => {
    return Object.keys(configs).map(key => (
      <PerSettings
        key={key}
        configsMap={configsMap}
        config={configs[key]}
        currentConfigKey={key}
        save={save}
        delete={deleteConfig}
        fieldGroups={fieldGroups}
      />
    ));
  };

  const renderContent = () => {
    const configs = configsMap.similarityGroup || {};

    if (loading) {
      return <Spinner objective={true} />;
    }

    if (!loading && Object.keys(configs).length === 0) {
      return (
        <EmptyState
          image="/images/actions/8.svg"
          text="No Uoms config"
          size="small"
        />
      );
    }

    return (
      <ContentBox id={"GeneralSettingsMenu"}>
        {renderConfigs(configs)}
      </ContentBox>
    );
  };

  const breadcrumb = [
    { title: __("Settings"), link: "/settings" },
    { title: __("Products similarity group config") }
  ];

  const actionButtons = (
    <Button
      btnStyle="success"
      onClick={add}
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
          title={__("Products similarity group config")}
          breadcrumb={breadcrumb}
        />
      }
      mainHead={
        <HeaderDescription
          icon="/images/actions/25.svg"
          title="Products similiraty config"
          description=""
        />
      }
      actionBar={
        <Wrapper.ActionBar
          left={<Title>{__("Products similarity configs")}</Title>}
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
