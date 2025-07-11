import { Alert, Icon, __ } from "@erxes/ui/src";
import { FormControl, FormGroup } from "@erxes/ui/src/components/form";

import Button from "@erxes/ui/src/components/Button";
import Common from "@erxes/ui-automations/src/components/forms/actions/Common";
import ControlLabel from "@erxes/ui/src/components/form/Label";
import { DrawerDetail } from "@erxes/ui-automations/src/styles";
import { FieldsCombinedByType } from "@erxes/ui-forms/src/settings/properties/types";
import { GroupWrapper } from "@erxes/ui-segments/src/styles";
import { IAction } from "@erxes/ui-automations/src/types";
import { PROPERTY_OPERATOR } from "../constants";
import PlaceHolderInput from "@erxes/ui-automations/src/components/forms/actions/placeHolder/PlaceHolderInput";
import React from "react";
import Select from "react-select";
import Tip from "@erxes/ui/src/components/Tip";
import client from "@erxes/ui/src/apolloClient";
import { excludedNames } from "../../../../containers/forms/actions/subForms/SetProperty";
import { queries as formQueries } from "@erxes/ui-forms/src/forms/graphql";
import { gql } from "@apollo/client";
import Picker from "@emoji-mart/react";
import emojiPickerData from "@emoji-mart/data";
import Popover from "@erxes/ui/src/components/Popover";

type Props = {
  closeModal: () => void;
  activeAction: IAction;
  triggerType: string;
  triggerConfig: any;
  addAction: (action: IAction, actionId?: string, config?: any) => void;
  fields: FieldsCombinedByType[];
  propertyTypesConst: any[];
};

type State = {
  config: any;
  type: string;
  fields: FieldsCombinedByType[];
};

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

class SetProperty extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    const { config } = this.props.activeAction;
    const fillConfig = config || {};

    if (!fillConfig.rules) {
      fillConfig.rules = [{ id: Math.random() }];
    }

    this.state = {
      config: fillConfig,
      type: fillConfig.module || "",
      fields: this.props.fields || [],
    };
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.activeAction !== this.props.activeAction) {
      this.setState({ config: nextProps.activeAction.config });
    }
  }

  onChangeField = (name: string, value: string) => {
    const { config } = this.state;
    config[name] = value;

    this.setState({ config });
  };

  onChangeType = ({ value }: any) => {
    client
      .query({
        query: gql(formQueries.fieldsCombinedByContentType),
        fetchPolicy: "network-only",
        variables: { contentType: value, excludedNames },
      })
      .then((data) => {
        this.setState({ fields: data.data.fieldsCombinedByContentType });
      })
      .catch((e) => {
        Alert.error(e.message);
      });

    this.setState({ type: value });
    this.onChangeField("module", value);
  };

  getFieldType = (chosenField: FieldsCombinedByType) => {
    if (chosenField.selectOptions && chosenField.selectOptions?.length > 0) {
      return "select";
    }

    if (chosenField.type === "Date") {
      return "date";
    }

    if (chosenField.name.includes("customFieldsData")) {
      return chosenField.validation;
    }

    return chosenField.type;
  };

  getIsMulti = (chosenField: FieldsCombinedByType) => {
    if (
      !!chosenField?.selectOptions?.length &&
      !chosenField.name.includes("Ids")
    ) {
      return false;
    }

    return true;
  };

  addRule = () => {
    const { config } = this.state;
    config.rules.push({ id: Math.random() });
    this.setState({ config });
  };

  removeRule = (id) => {
    const { config } = this.state;
    config.rules = config.rules.filter((r) => r.id !== id);
    this.setState({ config });
  };

  renderPerValue() {
    const { triggerType, triggerConfig } = this.props;
    const { type, config, fields } = this.state;

    return config.rules.map((rule) => {
      const chosenField: { selectionConfig?: any } & FieldsCombinedByType =
        fields.find((f) => f.name === rule.field) || {
          _id: String(Math.random()),
          type: "Default",
          name: "name",
          label: "label",
        };

      const operatorType: string = chosenField.name.includes("customFieldsData")
        ? capitalizeFirstLetter(chosenField.validation || "String")
        : chosenField.type;

      const operators =
        PROPERTY_OPERATOR[operatorType] || PROPERTY_OPERATOR.Default;

      const onChangeSelect = (field, e) => {
        const value = e.value;

        rule = { ...rule, [field]: value };

        this.onChangeField(
          "rules",
          config.rules.map((r) => (r.id === rule.id ? { ...rule } : r))
        );
      };

      const onChangeValue = (rConf) => {
        this.onChangeField(
          "rules",
          config.rules.map((r) =>
            r.id === rule.id ? { ...rule, ...rConf } : r
          )
        );
      };

      const onChangeForwardToValue = (e) => {
        const value = e.currentTarget.value;

        rule = { ...rule, forwardTo: value };

        this.onChangeField(
          "rules",
          config.rules.map((r) => (r.id === rule.id ? { ...rule } : r))
        );
      };

      const fieldOptions = fields.map((f) => ({
        label: f.label,
        value: f.name,
      }));

      const operatorOptions = operators.map((f) => ({
        label: f.label,
        value: f.value,
      }));

      const additionalContent = () => {
        return (
          <Popover
            trigger={
              <span>
                {__("Emojis")} <Icon icon='angle-down' />
              </span>
            }
            placement='bottom'
            closeAfterSelect={true}
          >
            {(close) => (
              <Picker
                theme='light'
                data={emojiPickerData}
                onEmojiSelect={(emoji) => {
                  this.onChangeField(
                    "rules",
                    config.rules.map((r) =>
                      r.id === rule.id
                        ? {
                            ...rule,
                            value: `${rule?.value || ""}${emoji.native}`,
                          }
                        : r
                    )
                  );
                  close();
                }}
              />
            )}
          </Popover>
        );
      };

      return (
        <GroupWrapper key={rule.id}>
          <FormGroup>
            <ControlLabel>Field</ControlLabel>

            <Select
              isClearable={true}
              value={fieldOptions.find((o) => o.value === rule.field)}
              options={fieldOptions}
              onChange={onChangeSelect.bind(this, "field")}
              placeholder={__("Choose field")}
            />
          </FormGroup>

          <FormGroup>
            <ControlLabel>Operator</ControlLabel>

            <Select
              isClearable={true}
              value={operatorOptions.find((o) => o.value === rule.operator)}
              options={operatorOptions}
              onChange={onChangeSelect.bind(this, "operator")}
              placeholder={__("Choose operator")}
            />
          </FormGroup>

          <PlaceHolderInput
            inputName='value'
            label='Value'
            config={rule}
            onChange={onChangeValue}
            triggerType={triggerType}
            type={type}
            fieldType={this.getFieldType(chosenField)}
            isMulti={this.getIsMulti(chosenField)}
            attrType={operatorType}
            options={chosenField.selectOptions}
            optionsAllowedTypes={
              chosenField?.selectionConfig ? [chosenField?.type] : []
            }
            triggerConfig={triggerConfig}
            selectConfig={chosenField?.selectionConfig}
            attrWithSegmentConfig={true}
            additionalContent={additionalContent()}
          />

          <FormGroup>
            <ControlLabel>{__("Forward to")}</ControlLabel>

            <FormControl
              onChange={onChangeForwardToValue}
              value={rule.forwardTo}
            />
          </FormGroup>

          <Tip text={"Delete"}>
            <Button
              btnStyle='simple'
              size='small'
              onClick={this.removeRule.bind(this, rule.id)}
              icon='times'
            />
          </Tip>
        </GroupWrapper>
      );
    });
  }

  renderContent() {
    const { type } = this.state;
    const { propertyTypesConst } = this.props;

    const options = propertyTypesConst.map((p) => ({
      label: p.label,
      value: p.value,
    }));

    const selectedProperty = options.find(({ value }) => value === type);

    return (
      <DrawerDetail>
        <FormGroup>
          <ControlLabel>Property type</ControlLabel>

          <Select
            required={true}
            value={selectedProperty || { value: "", label: "" }}
            options={options}
            onChange={this.onChangeType}
            placeholder={__("Choose type")}
          />
        </FormGroup>

        {this.renderPerValue()}

        <Button
          btnStyle='simple'
          type='button'
          onClick={this.addRule}
          icon='add'
        >
          {__("Add Rule")}
        </Button>
      </DrawerDetail>
    );
  }

  render() {
    return (
      <Common config={this.state.config} {...this.props}>
        {this.renderContent()}
      </Common>
    );
  }
}

export default SetProperty;
