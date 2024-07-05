import {
  Button,
  CollapseContent,
  ControlLabel,
  FormControl,
  FormGroup,
  Icon,
} from "@erxes/ui/src/components";
import { FormColumn, FormWrapper } from "@erxes/ui/src/styles/main";

import { IConfigsMap } from "../../types";
import { KEY_LABELS } from "../../constants";
import { MainStyleModalFooter as ModalFooter } from "@erxes/ui/src/styles/eindex";
import React from "react";
import SelectBrand from "@erxes/ui-inbox/src/settings/integrations/containers/SelectBrand";
import { __ } from "@erxes/ui/src/utils";

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
};

class PerSettings extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      config: props.config,
      hasOpen: false,
    };
  }

  onSave = (e) => {
    e.preventDefault();
    const { configsMap, currentConfigKey = "" } = this.props;
    const { config } = this.state;
    const newKey = config.brandId;

    const tempDynamic = {};
    Object.keys(configsMap?.DYNAMIC || {}).forEach(key => {
      if (key !== currentConfigKey) {
        tempDynamic[key] = configsMap?.DYNAMIC[key]
      }
    })

    tempDynamic[newKey] = config;
    this.props.save({...configsMap, DYNAMIC: tempDynamic});
  };

  onDelete = (e) => {
    e.preventDefault();

    this.props.delete(this.props.currentConfigKey);
  };

  onChangeConfig = (code: string, value) => {
    const { config } = this.state;
    this.setState({ config: {...config, [code]: value} });
  };

  onChangeBrand = (brandId, e: any) => {
    this.onChangeConfig(brandId, e.target.value);
  };

  onChangeInput = (code: string, e) => {
    this.onChangeConfig(code, e.target.value);
  };

  renderInput = (key: string) => {
    const { config } = this.state;

    return (
      <FormGroup>
        <ControlLabel>{KEY_LABELS[key]}</ControlLabel>
        <FormControl
          defaultValue={config[key]}
          onChange={this.onChangeInput.bind(this, key)}
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
          </FormColumn>

          <FormColumn>
            {this.renderInput("customerApi")}
            {this.renderInput("salesApi")}
            {this.renderInput("salesLineApi")}
            {this.renderInput("password")}
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
            </FormColumn>
            <FormColumn>
              {this.renderInput("locationCode")}
              {this.renderInput("responsibilityCenter")}
              {this.renderInput("billType")}
              {this.renderInput("dealType")}
              {this.renderInput("paymentTermsCode")}
              {this.renderInput("paymentMethodCode")}
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
