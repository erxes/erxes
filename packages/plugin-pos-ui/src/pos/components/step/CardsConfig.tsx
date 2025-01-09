import { queries as formQueries } from "@erxes/ui-forms/src/forms/graphql";
import { FieldsCombinedByType } from "@erxes/ui-forms/src/settings/properties/types";
import { Alert, Button, __ } from "@erxes/ui/src";
import client from "@erxes/ui/src/apolloClient";
import { LeftItem } from "@erxes/ui/src/components/step/styles";
import { isEnabled } from "@erxes/ui/src/utils/core";
import { gql } from "@apollo/client";
import React, { useEffect, useState } from "react";
import { Block, FlexColumn, FlexItem, FlexRow } from "../../../styles";
import { IConfigsMap, IPos } from "../../../types";
import PerConfigs from "../cardsGroup/PerConfigs";

type Props = {
  onChange: (name: "cardsConfig", value: any) => void;
  pos?: IPos;
};

const CardsConfig = (props: Props) => {
  const { pos, onChange } = props;

  const [config, setConfig] = useState<IConfigsMap>(pos?.cardsConfig || {});

  const [fieldsCombined, setFieldsCombined] = useState<FieldsCombinedByType[]>(
    []
  );

  useEffect(() => {
    client
      .query({
        query: gql(formQueries.fieldsCombinedByContentType),
        variables: {
          contentType: "sales:deal"
        }
      })
      .then(({ data }) => {
        setFieldsCombined(data ? data.fieldsCombinedByContentType : [] || []);
      });
  }, []);

  const handleAdd = e => {
    e.preventDefault();

    setConfig(prevConfig => ({
      ...prevConfig,
      newCardsConfig: {
        branchId: "",
        boardId: "",
        pipelineId: "",
        stageId: "",
        assignedUserIds: [],
        deliveryMapField: ""
      }
    }));
  };

  const handleDelete = (currentConfigKey: string) => {
    const newConfig = {};

    Object.keys(config).forEach(key => {
      if (key !== currentConfigKey) {
        newConfig[key] = config[key];
      }
    });

    setConfig(newConfig);
    onChange("cardsConfig", newConfig);

    Alert.success("You successfully deleted stage in cards settings.");
  };

  const handleEdit = (oldKey, currenConfig: any) => {
    const newConfig = {};

    Object.keys(config).forEach(key => {
      if (key !== oldKey) {
        newConfig[key] = config[key];
      }
    });

    newConfig[currenConfig.branchId] = { ...currenConfig };
    setConfig(newConfig);
    onChange("cardsConfig", newConfig);
  };

  const renderCollapse = () => {
    const actionButtons = (
      <Button
        btnStyle="primary"
        onClick={handleAdd}
        icon="plus"
        uppercase={false}
      >
        New config
      </Button>
    );
    return (
      <FlexRow>
        <LeftItem>
          {actionButtons}
          <br />
          <br />
          {Object.keys(config).map(key => (
            <PerConfigs
              key={key}
              config={config[key]}
              fieldsCombined={fieldsCombined}
              configKey={key}
              save={handleEdit}
              delete={handleDelete}
            />
          ))}
        </LeftItem>
      </FlexRow>
    );
  };

  return (
    <FlexItem>
      <FlexColumn>
        <LeftItem>
          <Block>{renderCollapse()}</Block>
        </LeftItem>
      </FlexColumn>
    </FlexItem>
  );
};

export default CardsConfig;
