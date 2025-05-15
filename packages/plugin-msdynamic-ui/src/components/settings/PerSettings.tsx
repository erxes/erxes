import {
  Button,
  CollapseContent,
  ControlLabel,
  FormControl,
  FormGroup,
  Icon
} from "@erxes/ui/src/components";
import { FormColumn, FormWrapper } from "@erxes/ui/src/styles/main";
import client from "@erxes/ui/src/apolloClient";
import { gql } from "@apollo/client";
import { queries as boardQueries } from "@erxes/ui-sales/src/boards/graphql";
import { queries as fieldQueries } from "@erxes/ui-forms/src/settings/properties/graphql";

import { IConfigsMap } from "../../types";
import { KEY_LABELS } from "../../constants";
import { MainStyleModalFooter as ModalFooter } from "@erxes/ui/src/styles/eindex";
import React from "react";
import SelectBrand from "@erxes/ui-inbox/src/settings/integrations/containers/SelectBrand";
import { __ } from "@erxes/ui/src/utils";
import BoardSelectContainer from "@erxes/ui-sales/src/boards/containers/BoardSelect";
import { IFieldGroup } from "@erxes/ui-forms/src/settings/properties/types";

type Props = {
  configsMap: IConfigsMap;
  config: any;
  currentConfigKey: string;
  save: (configsMap: IConfigsMap) => void;
  delete: (currentConfigKey: string) => void;
};

type State = {
  config: any;
  hasOpen: boolean;
  pipeline?: any;
  fieldGroups?: IFieldGroup[];
};

class PerSettings extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      config: props.config,
      hasOpen: false
    };

    client
      .query({
        query: gql(fieldQueries.fieldsGroups),
        variables: {
          contentType: "core:user"
        }
      })
      .then(({ data }) => {
        this.setState({ fieldGroups: data?.fieldsGroups });
      });
  }

  onSave = (e) => {
    e.preventDefault();
    const { configsMap, currentConfigKey = "" } = this.props;
    const { config } = this.state;
    const newKey = config.brandId;

    const tempDynamic = {};
    Object.keys(configsMap?.DYNAMIC || {}).forEach((key) => {
      if (key !== currentConfigKey) {
        tempDynamic[key] = configsMap?.DYNAMIC[key];
      }
    });

    tempDynamic[newKey] = config;
    this.props.save({ ...configsMap, DYNAMIC: tempDynamic });
  };

  onDelete = (e) => {
    e.preventDefault();

    this.props.delete(this.props.currentConfigKey);
  };

  onChangeConfig = (code: string, value) => {
    const { config } = this.state;
    this.setState({ config: { ...config, [code]: value } });
  };

  onChangeBrand = (brandId, e: any) => {
    this.onChangeConfig(brandId, e.target.value);
  };

  onChangeBoard = (boardId: string) => {
    this.setState({ config: { ...this.state.config, boardId } });
  };

  onChangePipeline = (pipelineId: string) => {
    this.setState({ config: { ...this.state.config, pipelineId } }, () => {
      if (pipelineId) {
        client
          .query({
            query: gql(boardQueries.pipelineDetail),
            variables: { _id: pipelineId }
          })
          .then(({ data }) => {
            this.setState({ pipeline: data?.salesPipelineDetail || {} });
          });
      }
    });
  };

  onChangeStage = (stageId: string) => {
    this.setState({ config: { ...this.state.config, stageId } });
  };

  onChangeInput = (code: string, e) => {
    this.onChangeConfig(code, e.target.value);
  };

  renderInput = (key: string, args?: any) => {
    const { config } = this.state;

    return (
      <FormGroup>
        <ControlLabel>{KEY_LABELS[key]}</ControlLabel>
        <FormControl
          defaultValue={config[key]}
          onChange={this.onChangeInput.bind(this, key)}
          {...args}
        />
      </FormGroup>
    );
  };

  renderFields = (key: string, label: string) => {
    const { fieldGroups, config } = this.state;

    const setFieldGroup = (value) => {
      this.setState({
        config: {
          ...config,
          [key]: { ...(config[key] || {}), groupId: value }
        }
      });
    };

    const setFormField = (value) => {
      this.setState({
        config: {
          ...config,
          [key]: { ...(config[key] || {}), fieldId: value }
        }
      });
    };

    return (
      <FormGroup>
        <ControlLabel>{__(`${label}`)}</ControlLabel>
        <FormControl
          name="fieldGroup"
          componentclass="select"
          options={[
            { value: "", label: "Empty" },
            ...(fieldGroups || []).map((fg) => ({
              value: fg._id,
              label: `${fg.code} - ${fg.name}`
            }))
          ]}
          value={config[key]?.groupId}
          onChange={(e) => setFieldGroup((e.target as any).value)}
        />

        <FormControl
          name="formField"
          componentclass="select"
          options={[
            { value: "", label: "Empty" },
            ...(
              (
                (fieldGroups || []).find(
                  (fg) => fg._id === config[key]?.groupId
                ) || {}
              ).fields ||
              [] ||
              []
            ).map((f) => ({
              value: f._id,
              label: `${f.code} - ${f.text}`
            }))
          ]}
          value={config[key]?.fieldId}
          onChange={(e) => setFormField((e.target as any).value)}
        />
      </FormGroup>
    );
  };

  onChangeCheckbox = (code: string, e) => {
    this.onChangeConfig(code, e.target.checked);
  };

  renderCheckbox = (key: string) => {
    const { config } = this.state;

    return (
      <FormGroup>
        <ControlLabel>{KEY_LABELS[key]}</ControlLabel>
        <FormControl
          checked={config[key]}
          componentclass="checkbox"
          onChange={this.onChangeCheckbox.bind(this, key)}
        />
      </FormGroup>
    );
  };

  render() {
    const { config } = this.state;

    return (
      <CollapseContent
        title={__(config.title)}
        beforeTitle={<Icon icon="settings" />}
        transparent={true}
        open={this.props.currentConfigKey === "newDYNAMIC" ? true : false}
      >
        <FormGroup>
          <ControlLabel>{"Title"}</ControlLabel>
          <FormControl
            defaultValue={config.title}
            onChange={this.onChangeInput.bind(this, "title")}
            required={true}
            autoFocus={true}
          />
        </FormGroup>
        <FormGroup>
          <SelectBrand
            isRequired={true}
            defaultValue={config.brandId}
            onChange={this.onChangeBrand.bind(this, "brandId")}
          />
        </FormGroup>

        <FormWrapper>
          <FormColumn>
            {this.renderInput("itemApi")}
            {this.renderInput("itemCategoryApi")}
            {this.renderInput("priceApi")}
            {this.renderInput("pricePriority")}
            {this.renderInput("username")}
            {this.renderInput("password", { type: "password" })}

            {this.renderFields("custCode", "Cust code")}
            {this.renderFields("userLocationCode", "User Location code")}
          </FormColumn>

          <FormColumn>
            {this.renderInput("customerApi")}
            {this.renderInput("salesApi")}
            {this.renderInput("salesLineApi")}
            {this.renderInput("exchangeRateApi")}
            {this.renderInput("discountSoapApi")}
            {this.renderCheckbox("useBoard")}
            {(this.state.config.useBoard && (
              <FormGroup>
                <BoardSelectContainer
                  type="deal"
                  autoSelectStage={false}
                  boardId={config.boardId}
                  pipelineId={config.pipelineId}
                  stageId={config.stageId}
                  onChangeBoard={this.onChangeBoard}
                  onChangePipeline={this.onChangePipeline}
                  onChangeStage={this.onChangeStage}
                />
              </FormGroup>
            )) || <></>}
          </FormColumn>
        </FormWrapper>

        <CollapseContent title="General settings">
          <FormWrapper>
            <FormColumn>
              {this.renderInput("genBusPostingGroup")}
              {this.renderInput("vatBusPostingGroup")}
              {this.renderInput("customerPostingGroup")}
              {this.renderInput("customerPricingGroup")}
              {this.renderInput("customerDiscGroup")}
              {this.renderInput("syncType")}
              {this.renderInput("defaultUserCode")}
            </FormColumn>
            <FormColumn>
              {this.renderInput("locationCode")}
              {this.renderInput("reminderCode")}
              {this.renderInput("responsibilityCenter")}
              {this.renderInput("billType")}
              {this.renderInput("dealType")}
              {this.renderInput("paymentTermsCode")}
              {this.renderInput("paymentMethodCode")}
              {this.renderInput("defaultCompanyCode")}
            </FormColumn>
          </FormWrapper>
        </CollapseContent>

        <ModalFooter>
          <Button
            btnStyle="danger"
            icon="cancel-1"
            onClick={this.onDelete}
            uppercase={false}
          >
            Delete
          </Button>

          <Button
            btnStyle="success"
            icon="check-circle"
            onClick={this.onSave}
            uppercase={false}
            disabled={config.brandId ? false : true}
          >
            Save
          </Button>
        </ModalFooter>
      </CollapseContent>
    );
  }
}
export default PerSettings;
