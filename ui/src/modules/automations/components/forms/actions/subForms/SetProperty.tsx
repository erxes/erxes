import React from 'react';
import Select from 'react-select-plus';
import { IAction } from 'modules/automations/types';
import Common from '../Common';
import { DrawerDetail } from 'modules/automations/styles';
import FormGroup from 'modules/common/components/form/Group';
import ControlLabel from 'modules/common/components/form/Label';
import {
  PROPERTY_TYPES,
  PROPERTY_FIELD,
  PROPERTY_OPERATOR
} from '../constants';
import { __ } from 'modules/common/utils';
import FormControl from 'modules/common/components/form/Control';

type Props = {
  closeModal: () => void;
  activeAction: IAction;
  addAction: (
    action: IAction,
    contentId?: string,
    actionId?: string,
    config?: any
  ) => void;
};

type State = {
  config: any;
};

class SetProperty extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    const { config = {} } = this.props.activeAction;

    this.state = {
      config
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

  renderContent() {
    const { config } = this.state;

    const onChangeSelect = (field, e) => this.onChangeField(field, e.value);
    const onChangeValue = e => this.onChangeField('value', e.target.value);

    return (
      <DrawerDetail>
        <FormGroup>
          <ControlLabel>Property type</ControlLabel>

          <Select
            isRequired={true}
            value={config.module}
            options={PROPERTY_TYPES.map(p => ({
              label: p.label,
              value: p.value
            }))}
            onChange={onChangeSelect.bind(this, 'module')}
            placeholder={__('Choose type')}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>Field</ControlLabel>

          <Select
            value={config.field}
            options={PROPERTY_FIELD.map(f => ({
              label: f.label,
              value: f.value
            }))}
            onChange={onChangeSelect.bind(this, 'field')}
            placeholder={__('Choose field')}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>Operator</ControlLabel>

          <Select
            value={config.operator}
            options={PROPERTY_OPERATOR.map(f => ({
              label: f.label,
              value: f.value
            }))}
            onChange={onChangeSelect.bind(this, 'operator')}
            placeholder={__('Choose operator')}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>Value</ControlLabel>
          <FormControl onChange={onChangeValue} value={config.value} />
        </FormGroup>
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
