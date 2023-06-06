import { DrawerDetail } from '@erxes/ui-automations/src/styles';
import { IAction } from '@erxes/ui-automations/src/types';
import { Alert, __ } from 'coreui/utils';

import Button from '@erxes/ui/src/components/Button';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import { FieldsCombinedByType } from '@erxes/ui-forms/src/settings/properties/types';
import { FormGroup, FormControl } from '@erxes/ui/src/components/form';
import React from 'react';
import Select from 'react-select-plus';

import Common from '@erxes/ui-automations/src/components/forms/actions/Common';
import { PROPERTY_OPERATOR } from '../constants';
import PlaceHolderInput from '@erxes/ui-automations/src/components/forms/actions/placeHolder/PlaceHolderInput';
import { GroupWrapper } from '@erxes/ui-segments/src/styles';
import Tip from '@erxes/ui/src/components/Tip';
import client from '@erxes/ui/src/apolloClient';
import { excludedNames } from '../../../../containers/forms/actions/subForms/SetProperty';
import { queries as formQueries } from '@erxes/ui-forms/src/forms/graphql';
import { gql } from '@apollo/client';

type Props = {
  closeModal: () => void;
  activeAction: IAction;
  triggerType: string;
  addAction: (action: IAction, actionId?: string, config?: any) => void;
  fields: FieldsCombinedByType[];
  propertyTypesConst: any[];
};

type State = {
  config: any;
  type: string;
  fields: FieldsCombinedByType[];
};

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
      type: fillConfig.module || '',
      fields: this.props.fields || []
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

  onChangeType = (option: { value: string }) => {
    const type = !option ? '' : option.value.toString();

    client
      .query({
        query: gql(formQueries.fieldsCombinedByContentType),
        fetchPolicy: 'network-only',
        variables: { contentType: type, excludedNames }
      })
      .then(data => {
        this.setState({ fields: data.data.fieldsCombinedByContentType });
      })
      .catch(e => {
        Alert.error(e.message);
      });

    this.setState({ type });
    this.onChangeField('module', type);
  };

  getFieldType = (chosenField: FieldsCombinedByType) => {
    if (chosenField.selectOptions) {
      return 'select';
    }

    if (chosenField.type === 'Date') {
      return 'date';
    }

    return chosenField.type;
  };

  getIsMulti = (chosenField: FieldsCombinedByType) => {
    if (chosenField.selectOptions && !chosenField.name.includes('Ids')) {
      return false;
    }
    return true;
  };

  addRule = () => {
    const { config } = this.state;
    config.rules.push({ id: Math.random() });
    this.setState({ config });
  };

  removeRule = id => {
    const { config } = this.state;
    config.rules = config.rules.filter(r => r.id !== id);
    this.setState({ config });
  };

  renderPerValue() {
    const { triggerType } = this.props;
    const { type, config, fields } = this.state;

    return config.rules.map(rule => {
      const chosenField: FieldsCombinedByType = fields.find(
        f => f.name === rule.field
      ) || {
        _id: String(Math.random()),
        type: 'Default',
        name: 'name',
        label: 'label'
      };
      const operators =
        PROPERTY_OPERATOR[chosenField.type] || PROPERTY_OPERATOR.Default;

      const onChangeSelect = (field, e) => {
        const value = e.value;

        rule = { ...rule, [field]: value };

        this.onChangeField(
          'rules',
          config.rules.map(r => (r.id === rule.id ? { ...rule } : r))
        );
      };

      const onChangeValue = rConf => {
        this.onChangeField(
          'rules',
          config.rules.map(r => (r.id === rule.id ? { ...rule, ...rConf } : r))
        );
      };

      const onChangeForwardToValue = e => {
        const value = e.currentTarget.value;

        rule = { ...rule, forwardTo: value };

        this.onChangeField(
          'rules',
          config.rules.map(r => (r.id === rule.id ? { ...rule } : r))
        );
      };

      return (
        <GroupWrapper key={rule.id}>
          <FormGroup>
            <ControlLabel>Field</ControlLabel>

            <Select
              value={rule.field}
              options={fields.map(f => ({
                label: f.label,
                value: f.name
              }))}
              onChange={onChangeSelect.bind(this, 'field')}
              placeholder={__('Choose field')}
            />
          </FormGroup>

          <FormGroup>
            <ControlLabel>Operator</ControlLabel>

            <Select
              value={rule.operator}
              options={operators.map(f => ({
                label: f.label,
                value: f.value
              }))}
              onChange={onChangeSelect.bind(this, 'operator')}
              placeholder={__('Choose operator')}
            />
          </FormGroup>

          <PlaceHolderInput
            inputName="value"
            label="Value"
            config={rule}
            onChange={onChangeValue}
            triggerType={triggerType}
            type={type}
            fieldType={this.getFieldType(chosenField)}
            isMulti={this.getIsMulti(chosenField)}
            attrType={chosenField.type}
            options={chosenField.selectOptions}
          />

          <FormGroup>
            <ControlLabel>{__('Forward to')}</ControlLabel>

            <FormControl
              onChange={onChangeForwardToValue}
              value={rule.forwardTo}
            />
          </FormGroup>

          <Tip text={'Delete'}>
            <Button
              btnStyle="simple"
              size="small"
              onClick={this.removeRule.bind(this, rule.id)}
              icon="times"
            />
          </Tip>
        </GroupWrapper>
      );
    });
  }

  renderContent() {
    const { type } = this.state;
    const { propertyTypesConst } = this.props;

    return (
      <DrawerDetail>
        <FormGroup>
          <ControlLabel>Property type</ControlLabel>

          <Select
            isRequired={true}
            value={type || ''}
            options={propertyTypesConst.map(p => ({
              label: p.label,
              value: p.value
            }))}
            onChange={this.onChangeType}
            placeholder={__('Choose type')}
          />
        </FormGroup>

        {this.renderPerValue()}

        <Button
          btnStyle="simple"
          type="button"
          onClick={this.addRule}
          icon="add"
        >
          {__('Add Rule')}
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
