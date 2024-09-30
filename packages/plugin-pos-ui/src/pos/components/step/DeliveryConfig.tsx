import BoardSelectContainer from "@erxes/ui-sales/src/boards/containers/BoardSelect";
import client from "@erxes/ui/src/apolloClient";
import { gql } from "@apollo/client";
import React, { useEffect, useState } from "react";
import Select from "react-select";
import SelectProducts from "@erxes/ui-products/src/containers/SelectProducts";
import { __, ControlLabel, FormGroup, SelectTeamMembers } from "@erxes/ui/src";
import { Block, BlockRow, FlexColumn, FlexItem } from "../../../styles";
import { FieldsCombinedByType } from "@erxes/ui-forms/src/settings/properties/types";
import { IPos } from "../../../types";
import { isEnabled } from "@erxes/ui/src/utils/core";
import { LeftItem } from "@erxes/ui/src/components/step/styles";
import { queries as formQueries } from "@erxes/ui-forms/src/forms/graphql";

type Props = {
  onChange: (name: "deliveryConfig", value: any) => void;
  pos?: IPos;
};

const DeliveryConfig = (props: Props) => {
  const { pos, onChange } = props;

  const [config, setConfig] = useState<any>(
    pos && pos.deliveryConfig
      ? pos.deliveryConfig
      : {
          boardId: "",
          pipelineId: "",
          stageId: "",
          watchedUserIds: [],
          assignedUserIds: [],
          productId: ""
        }
  );

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

  const onChangeConfig = (code: string, value) => {
    const newConfig = { ...config, [code]: value };

    setConfig(newConfig);
    onChange("deliveryConfig", newConfig);
  };

  const selectConfigOptions = (array: string[] = [], CONSTANT: any) => {
    return array.map(item => ({
      value: item,
      label: CONSTANT.find(el => el.value === item).label
    }));
  };

  const onChangeBoard = (boardId: string) => {
    onChangeConfig("boardId", boardId);
  };

  const onChangePipeline = (pipelineId: string) => {
    onChangeConfig("pipelineId", pipelineId);
  };

  const onChangeStage = (stageId: string) => {
    onChangeConfig("stageId", stageId);
  };

  const onWatchedUsersSelect = users => {
    onChangeConfig("watchedUserIds", users);
  };

  const onAssignedUsersSelect = users => {
    onChangeConfig("assignedUserIds", users);
  };

  const onMapCustomFieldChange = option => {
    const value = !option ? "" : option.value.toString();
    onChangeConfig("mapCustomField", value);
  };

  const onChangeProduct = option => {
    onChangeConfig("productId", option);
  };

  const mapFieldOptions = (fieldsCombined || []).map(f => ({
    value: f.name,
    label: f.label
  }));

  return (
    <FlexItem>
      <FlexColumn>
        <LeftItem>
          {(isEnabled("sales") && (
            <Block>
              <h4>{__("Stage")}</h4>
              <BlockRow>
                <BoardSelectContainer
                  type="deal"
                  autoSelectStage={false}
                  boardId={config.boardId}
                  pipelineId={config.pipelineId}
                  stageId={config.stageId}
                  onChangeBoard={onChangeBoard}
                  onChangePipeline={onChangePipeline}
                  onChangeStage={onChangeStage}
                />
              </BlockRow>
              <BlockRow>
                <FormGroup>
                  <ControlLabel>{__("Choose map field")}</ControlLabel>
                  <Select
                    name="mapCustomField"
                    value={mapFieldOptions.find(
                      o => o.value === config.mapCustomField
                    )}
                    onChange={onMapCustomFieldChange}
                    isClearable={true}
                    options={mapFieldOptions}
                  />
                </FormGroup>
              </BlockRow>
            </Block>
          )) ||
            "Please, enabled cards plugin"}
          <Block>
            <h4>{__("Deal users")}</h4>
            <BlockRow>
              <FormGroup>
                <ControlLabel>{__("Watched Users")}</ControlLabel>
                <SelectTeamMembers
                  label={__("Choose team member")}
                  name="watchedUserIds"
                  initialValue={config.watchedUserIds}
                  onSelect={onWatchedUsersSelect}
                />
              </FormGroup>
            </BlockRow>
            <BlockRow>
              <FormGroup>
                <ControlLabel>{__("Assigned Users")}</ControlLabel>
                <SelectTeamMembers
                  label={__("Choose team member")}
                  name="assignedUserIds"
                  initialValue={config.assignedUserIds}
                  onSelect={onAssignedUsersSelect}
                />
              </FormGroup>
            </BlockRow>
            <BlockRow>
              <FormGroup>
                <ControlLabel>{__("Delivery product")}</ControlLabel>
                <SelectProducts
                  label={__("Choose delivery product")}
                  name="product"
                  initialValue={config.productId}
                  multi={false}
                  onSelect={onChangeProduct}
                />
              </FormGroup>
            </BlockRow>
          </Block>
        </LeftItem>
      </FlexColumn>
    </FlexItem>
  );
};

export default DeliveryConfig;
