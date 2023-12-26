import React from 'react';
import {
  __,
  ControlLabel,
  FormControl,
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

  onChangeValue = (e, valueType?: string) => {
    const { pos } = this.props;
    const { config } = this.state;

    const keys = e.target.name.split('.');
    const type = keys[0];
    const name = keys[1];
    const value = e.target[valueType || 'checked'];
    const numericValue = parseFloat(value);
    const newConfig = {
      ...config,
      [type]: {
        ...config[type],
        [name]: isNaN(numericValue)
          ? value
          : numericValue > 100
          ? 100
          : numericValue
      }
    };

    this.setState({ config: newConfig });

    this.props.onChange('pos', { ...pos, permissionConfig: newConfig });
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
          onChange={this.onChangeValue}
          icons={{
            checked: <span>Yes</span>,
            unchecked: <span>No</span>
          }}
        />
      </FormGroup>
    );
  }

  renderDiscountInput(title: string, type: string, name: string) {
    const { config } = this.state;

    if (!(config[type] && config[type][name])) return null;

    return (
      <FormGroup>
        <ControlLabel>{title}</ControlLabel>
        <FormControl
          id={`${type}${name}`}
          name={`${type}.${name}Limit`}
          value={config[type] && config[type][`${name}Limit`]}
          onChange={e => this.onChangeValue(e, 'value')}
          max={100}
        />
      </FormGroup>
    );
  }

  render() {
    const { pos } = this.props;

    const onAdminSelect = users => {
      this.onChangeFunction({ ...pos, adminIds: users });
    };

    const onCashierSelect = users => {
      this.onChangeFunction({ ...pos, cashierIds: users });
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
                {this.renderToggle(
                  'Direct discount',
                  'admins',
                  'directDiscount'
                )}
                {this.renderDiscountInput(
                  'Direct discount limit',
                  'admins',
                  'directDiscount'
                )}
                {/* {this.renderToggle('Set unit price', 'admins', 'setUnitPrice')} */}
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
                  'Direct Discount',
                  'cashiers',
                  'directDiscount'
                )}
                {this.renderDiscountInput(
                  'Direct discount limit',
                  'cashiers',
                  'directDiscount'
                )}
                {/* {this.renderToggle(
                  'Set unit price',
                  'cashiers',
                  'setUnitPrice'
                )} */}
              </BlockRow>
            </Block>
          </LeftItem>
        </FlexColumn>
      </FlexItem>
    );
  }
}

export default PermissionStep;
