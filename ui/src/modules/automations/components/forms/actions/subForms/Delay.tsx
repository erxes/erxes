import React from 'react';
import Select from 'react-select-plus';
import { IAction } from 'modules/automations/types';
import Common from '../Common';
import { BoardHeader, DrawerDetail } from 'modules/automations/styles';
import FormGroup from 'modules/common/components/form/Group';
import ControlLabel from 'modules/common/components/form/Label';
import { __ } from 'modules/common/utils';
import FormControl from 'modules/common/components/form/Control';

type Props = {
  closeModal: () => void;
  activeAction: IAction;
  triggerType: string;
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

    this.state = { config };
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
          <ControlLabel>Type</ControlLabel>

          <Select
            value={config.type}
            options={[
              {
                label: 'Hour',
                value: 'hour'
              },
              {
                label: 'Day',
                value: 'day'
              }
            ]}
            onChange={onChangeSelect.bind(this, 'type')}
            placeholder={__('Choose type')}
            clearable={false}
          />
        </FormGroup>

        <BoardHeader>
          <FormGroup>
            <div className="header-row">
              <ControlLabel required={true}>Value</ControlLabel>
            </div>
            <FormControl
              type="number"
              onChange={onChangeValue}
              value={config.value}
            />
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
