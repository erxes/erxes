import client from 'apolloClient';
import gql from 'graphql-tag';
import { BoardHeader, DrawerDetail } from 'modules/automations/styles';
import { IAction } from 'modules/automations/types';
import FormControl from 'modules/common/components/form/Control';
import FormGroup from 'modules/common/components/form/Group';
import ControlLabel from 'modules/common/components/form/Label';
import { __, Alert } from 'modules/common/utils';
import { queries as formQueries } from 'modules/forms/graphql';
import { FieldsCombinedByType } from 'modules/settings/properties/types';
import React from 'react';
import Select from 'react-select-plus';

import Attribution from '../Attribution';
import Common from '../Common';
import { PROPERTY_OPERATOR, PROPERTY_TYPES } from '../constants';

type Props = {
  closeModal: () => void;
  activeAction: IAction;
  triggerType: string;
  addAction: (action: IAction, actionId?: string, config?: any) => void;
  fields: FieldsCombinedByType[];
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

    this.state = {
      config: fillConfig,
      type: fillConfig.module || '',
      fields: this.props.fields
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
        variables: { contentType: type }
      })
      .then(data => {
        console.log(data.data.fieldsCombinedByContentType);
        this.setState({ fields: data.data.fieldsCombinedByContentType });
      })
      .catch(e => {
        Alert.error(e.message);
      });

    this.setState({ type });
    this.onChangeField('module', type);
  };

  renderContent() {
    const { config, fields, type } = this.state;
    const operators =
      PROPERTY_OPERATOR[fields.filter(f => f.name === config.field)[0].type] ||
      PROPERTY_OPERATOR.Default;

    const onChangeSelect = (field, e) => this.onChangeField(field, e.value);
    const onChangeValue = e => this.onChangeField('value', e.target.value);

    return (
      <DrawerDetail>
        <FormGroup>
          <ControlLabel>Property type</ControlLabel>

          <Select
            isRequired={true}
            value={type || ''}
            options={PROPERTY_TYPES.map(p => ({
              label: p.label,
              value: p.value
            }))}
            onChange={this.onChangeType}
            placeholder={__('Choose type')}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>Field</ControlLabel>

          <Select
            value={config.field}
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
            value={config.operator}
            options={operators.map(f => ({
              label: f.label,
              value: f.value
            }))}
            onChange={onChangeSelect.bind(this, 'operator')}
            placeholder={__('Choose operator')}
          />
        </FormGroup>

        <BoardHeader>
          <FormGroup>
            <div className="header-row">
              <ControlLabel required={true}>Value</ControlLabel>
              <Attribution
                config={this.state.config}
                setConfig={conf => this.setState({ config: conf })}
                triggerType={this.props.triggerType}
              />
            </div>
            <FormControl onChange={onChangeValue} value={config.value} />
          </FormGroup>
        </BoardHeader>
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
