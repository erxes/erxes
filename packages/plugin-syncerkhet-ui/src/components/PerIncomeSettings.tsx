import {
  Button,
  CollapseContent,
  ControlLabel,
  FormControl,
  FormGroup,
  Icon
} from "@erxes/ui/src/components";
import { FormColumn, FormWrapper } from "@erxes/ui/src/styles/main";

import { BlockRow } from "../styles";
import BoardSelectContainer from "@erxes/ui-purchases/src/boards/containers/BoardSelect";
import { FieldsCombinedByType } from "@erxes/ui-forms/src/settings/properties/types";
import { IConfigsMap } from "../types";
import { MainStyleModalFooter as ModalFooter } from "@erxes/ui/src/styles/eindex";
import React from "react";
import Select from "react-select";
import { __ } from "@erxes/ui/src/utils";
import client from "@erxes/ui/src/apolloClient";
import { queries as formQueries } from "@erxes/ui-forms/src/forms/graphql";
import { gql } from "@apollo/client";
import { isEnabled } from "@erxes/ui/src/utils/core";

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
  fieldsCombined: FieldsCombinedByType[];
};

const paymentTypes = [
  { type: "prepay" },
  { type: "cash" },
  { type: "bank" },
  { type: "pos" },
  { type: "wallet" },
  { type: "barter" },
  { type: "after" },
  { type: "other" }
];

class PerSettings extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      config: props.config,
      hasOpen: false,
      fieldsCombined: []
    };

    client
      .query({
        query: gql(formQueries.fieldsCombinedByContentType),
        variables: {
          contentType: "sales:deal"
        }
      })
      .then(({ data }) => {
        this.setState({
          fieldsCombined: data ? data.fieldsCombinedByContentType : [] || []
        });
      });
  }

  onChangeBoard = (boardId: string) => {
    this.setState({ config: { ...this.state.config, boardId } });
  };

  onChangePipeline = (pipelineId: string) => {
    this.setState({ config: { ...this.state.config, pipelineId } });
  };

  onChangeStage = (stageId: string) => {
    this.setState({ config: { ...this.state.config, stageId } });
  };

  onSave = e => {
    e.preventDefault();
    const { configsMap, currentConfigKey } = this.props;
    const { stageInIncomeConfig } = configsMap;
    const { config } = this.state;
    const key = config.stageId;

    const newstageInIncomeConfig = { ...stageInIncomeConfig };
    delete newstageInIncomeConfig[currentConfigKey];
    newstageInIncomeConfig[key] = config;
    this.props.save({
      ...configsMap,
      stageInIncomeConfig: newstageInIncomeConfig
    });
  };

  onDelete = e => {
    e.preventDefault();

    this.props.delete(this.props.currentConfigKey);
  };

  onChangeCheckbox = (code: string, e) => {
    this.onChangeConfig(code, e.target.checked);
  };

  onChangeConfig = (code: string, value) => {
    const { config } = this.state;
    this.setState({ config: { ...config, [code]: value } });
  };

  onChangeInput = (code: string, e) => {
    this.onChangeConfig(code, e.target.value);
  };

  onChangePayAccount = (type: string, value: string) => {
    const { config } = this.state;
    this.setState({
      config: {
        ...config,
        payAccounts: { ...(config.payAccounts || {}), [type]: value }
      }
    });
  };

  onresponseCustomFieldChange = option => {
    const value = !option ? "" : option.value.toString();
    this.onChangeConfig("responseField", value);
  };

  renderInput = (key: string, title?: string, description?: string) => {
    const { config } = this.state;

    return (
      <FormGroup>
        <ControlLabel>{title || key}</ControlLabel>
        {description && <p>{__(description)}</p>}
        <FormControl
          defaultValue={config[key]}
          onChange={this.onChangeInput.bind(this, key)}
          required={true}
        />
      </FormGroup>
    );
  };

  renderCheckbox = (key: string, title?: string, description?: string) => {
    const { config } = this.state;

    return (
      <FormGroup>
        <ControlLabel>{title || key}</ControlLabel>
        {description && <p>{__(description)}</p>}
        <FormControl
          checked={config[key]}
          onChange={this.onChangeCheckbox.bind(this, key)}
          componentclass="checkbox"
        />
      </FormGroup>
    );
  };

  addCals = () => {
    const { config } = this.state;
    const { catAccLocMap = [] } = config;

    catAccLocMap.push({
      _id: Math.random().toString(),
      category: "",
      branch: "",
      department: "",
      account: "",
      location: ""
    });

    this.setState({ config: { ...config, catAccLocMap } });
  };

  renderCalsMap() {
    const { config } = this.state;
    const { catAccLocMap } = config;

    const cals: React.ReactNode[] = [];
    cals.push(
      <FormWrapper key={Math.random()}>
        <FormColumn>
          <ControlLabel>Product Category</ControlLabel>
        </FormColumn>
        <FormColumn>
          <ControlLabel>Branch</ControlLabel>
        </FormColumn>
        <FormColumn>
          <ControlLabel>Department</ControlLabel>
        </FormColumn>
        <FormColumn>
          <ControlLabel>Account</ControlLabel>
        </FormColumn>
        <FormColumn>
          <ControlLabel>Location</ControlLabel>
        </FormColumn>
        <FormColumn>
          <Button btnStyle="link" icon="plus-circle" onClick={this.addCals}>
            Add
          </Button>
        </FormColumn>
      </FormWrapper>
    );

    const editMapping = (id, e) => {
      const index = catAccLocMap.findIndex(i => i._id === id);

      const name = e.target.name;
      const value = e.target.value;

      const item = {
        ...(catAccLocMap.find(cal => cal._id === id) || {}),
        [name]: value
      };

      if (index !== -1) {
        catAccLocMap[index] = item;
      } else {
        catAccLocMap.push(item);
      }

      this.setState({ config: { ...config, catAccLocMap } });
    };

    const removeMapping = (_id: string) => {
      const excluded = catAccLocMap.filter(m => m._id !== _id);

      this.setState({ config: { ...config, catAccLocMap: excluded } });
    };

    for (const map of catAccLocMap || []) {
      cals.push(
        <FormWrapper key={map._id}>
          <FormColumn>
            <FormControl
              defaultValue={map.category}
              name="category"
              onChange={editMapping.bind(this, map._id)}
              required={true}
              autoFocus={true}
            />
          </FormColumn>
          <FormColumn>
            <FormControl
              defaultValue={map.branch}
              name="branch"
              onChange={editMapping.bind(this, map._id)}
              required={false}
              autoFocus={true}
            />
          </FormColumn>
          <FormColumn>
            <FormControl
              defaultValue={map.department}
              name="department"
              onChange={editMapping.bind(this, map._id)}
              required={false}
              autoFocus={true}
            />
          </FormColumn>
          <FormColumn>
            <FormControl
              defaultValue={map.account}
              name="account"
              onChange={editMapping.bind(this, map._id)}
              required={true}
              autoFocus={true}
            />
          </FormColumn>
          <FormColumn>
            <FormControl
              defaultValue={map.location}
              name="location"
              onChange={editMapping.bind(this, map._id)}
              required={true}
              autoFocus={true}
            />
          </FormColumn>
          <FormColumn>
            <Button
              btnStyle="link"
              icon="trash"
              onClick={() => removeMapping(map._id)}
            />
          </FormColumn>
        </FormWrapper>
      );
    }
    return cals;
  }

  render() {
    const { config } = this.state;
    const responseFieldOptions = (this.state.fieldsCombined || []).map(f => ({
      value: f.name,
      label: f.label
    }));
    return (
      <CollapseContent
        title={__(config.title)}
        beforeTitle={<Icon icon="settings" />}
        transparent={true}
        open={this.props.currentConfigKey === "newIncomeConfig" ? true : false}
      >
        <FormWrapper>
          <FormColumn>
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
              <BoardSelectContainer
                type="purchase"
                autoSelectStage={false}
                boardId={config.boardId}
                pipelineId={config.pipelineId}
                stageId={config.stageId}
                onChangeBoard={this.onChangeBoard}
                onChangePipeline={this.onChangePipeline}
                onChangeStage={this.onChangeStage}
              />
            </FormGroup>
            <FormGroup>
              <ControlLabel>{__("Choose response field")}</ControlLabel>
              <Select
                name="responseField"
                value={responseFieldOptions.find(
                  o => o.value === config.responseField
                )}
                onChange={this.onresponseCustomFieldChange}
                isClearable={true}
                options={responseFieldOptions}
              />
            </FormGroup>
          </FormColumn>
          <FormColumn>
            {this.renderInput("userEmail", "User Email", "")}
            {this.renderInput("defaultCustomer", "Default Customer", "")}
            {this.renderCheckbox("hasVat", "hasVat", "")}
            {this.renderCheckbox("hasCitytax", "hasCitytax", "")}
            {this.renderInput("vatRow", "Vat Row number", "")}
            {this.renderInput("defaultPayAccount", "Default Pay Account", "")}
          </FormColumn>
        </FormWrapper>
        <BlockRow>
          {(paymentTypes || []).map(pt => (
            <FormGroup key={pt.type}>
              <ControlLabel>{pt.type}</ControlLabel>
              <FormControl
                defaultValue={(config.payAccounts || {})[pt.type] || ""}
                onChange={e =>
                  this.onChangePayAccount(pt.type, (e.target as any).value)
                }
                required={true}
              />
            </FormGroup>
          ))}
        </BlockRow>
        {this.renderCalsMap()}

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
            disabled={config.stageId ? false : true}
          >
            Save
          </Button>
        </ModalFooter>
      </CollapseContent>
    );
  }
}
export default PerSettings;
