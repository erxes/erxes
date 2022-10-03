import React from 'react';
import {
  __,
  ControlLabel,
  FormGroup,
  SelectTeamMembers,
  Toggle
} from '@erxes/ui/src';
import { IPos } from '../../../types';
import { LeftItem } from '@erxes/ui/src/components/step/styles';
import { Block, BlockRow, FlexColumn, FlexItem } from '../../../styles';

type Props = {
  onChange: (name: 'pos', value: any) => void;
  pos: IPos;
  envs: any;
};

type State = {
  config: any;
};

class PermissionStep extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    const { pos } = props;

    this.state = {
      config: pos.permissionConfig || {}
    };
  }

  onChangeFunction = (value: any) => {
    this.props.onChange('pos', value);
  };

  onChangeSwitch = e => {
    const { pos } = this.props;
    const { config } = this.state;

    const keys = e.target.name.split('.');
    const type = keys[0];
    const name = keys[1];
    const value = e.target.checked;

    if (!config[type]) {
      config[type] = { [name]: value };
    } else {
      config[type][name] = value;
    }

    this.setState({ config });
    pos.permissionConfig = config;

    this.props.onChange('pos', pos);
  };

  renderToggle(title: string, type: string, name: string) {
    const { config } = this.state;

    return (
      <FormGroup>
        <ControlLabel>{title}</ControlLabel>
        <Toggle
          id={`${type}${name}`}
          name={`${type}.${name}`}
          checked={config[type] && config[type][name] ? true : false}
          onChange={this.onChangeSwitch}
          icons={{
            checked: <span>Yes</span>,
            unchecked: <span>No</span>
          }}
        />
      </FormGroup>
    );
  }

  render() {
    const { pos } = this.props;

    const onAdminSelect = users => {
      pos.adminIds = users;
      this.onChangeFunction(pos);
    };

    const onCashierSelect = users => {
      pos.cashierIds = users;
      this.onChangeFunction(pos);
    };

    let cashierIds: any = [];
    let adminIds: any = [];

    if (pos) {
      cashierIds = pos.cashierIds;
      adminIds = pos.adminIds;
    }

    return (
      <FlexItem>
        <FlexColumn>
          <LeftItem>
            <Block>
              <h4>{__('Admins')}</h4>

              <FormGroup>
                <ControlLabel required={true}>POS admin</ControlLabel>
                <SelectTeamMembers
                  label={__('Choose team member')}
                  name="adminIds"
                  initialValue={adminIds}
                  onSelect={onAdminSelect}
                />
              </FormGroup>
              <BlockRow>
                {this.renderToggle(
                  'Is Print Temp Bill',
                  'admins',
                  'isTempBill'
                )}
                {this.renderToggle('Set unit price', 'admins', 'setUnitPrice')}
                {this.renderToggle(
                  'Allow receivable',
                  'admins',
                  'allowReceivable'
                )}
              </BlockRow>
            </Block>

            <Block>
              <h4>{__('Cashiers')}</h4>
              <FormGroup>
                <ControlLabel required={true}>POS cashier</ControlLabel>
                <SelectTeamMembers
                  label={__('Choose team member')}
                  name="cashierIds"
                  initialValue={cashierIds}
                  onSelect={onCashierSelect}
                />
              </FormGroup>
              <BlockRow>
                {this.renderToggle(
                  'Is Print Temp Bill',
                  'cashiers',
                  'isTempBill'
                )}
                {this.renderToggle(
                  'Set unit price',
                  'cashiers',
                  'setUnitPrice'
                )}
                {this.renderToggle(
                  'Allow receivable',
                  'cashiers',
                  'allowReceivable'
                )}
              </BlockRow>
            </Block>
          </LeftItem>
        </FlexColumn>
      </FlexItem>
    );
  }
}

export default PermissionStep;
