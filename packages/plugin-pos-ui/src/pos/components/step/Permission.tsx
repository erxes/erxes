import React, { useState } from 'react';
import {
  __,
  ControlLabel,
  FormControl,
  FormGroup,
  SelectTeamMembers,
  Toggle,
} from '@erxes/ui/src';
import { IPos } from '../../../types';
import { LeftItem } from '@erxes/ui/src/components/step/styles';
import { Block, BlockRow, FlexColumn, FlexItem } from '../../../styles';

type Props = {
  onChange: (name: 'pos', value: any) => void;
  pos: IPos;
  envs: any;
};

const Permission = (props: Props) => {
  const { onChange, pos, envs } = props;

  const [config, setConfig] = useState(pos.permissionConfig || {});

  let cashierIds: any = [];
  let adminIds: any = [];

  if (pos) {
    cashierIds = pos.cashierIds;
    adminIds = pos.adminIds;
  }

  const onChangeFunction = (value: any) => {
    onChange('pos', value);
  };

  const onAdminSelect = (users) => {
    onChangeFunction({ ...pos, adminIds: users });
  };

  const onCashierSelect = (users) => {
    onChangeFunction({ ...pos, cashierIds: users });
  };

  const onChangeValue = (e, valueType?: string) => {
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
            : numericValue,
      },
    };

    setConfig(newConfig);

    onChange('pos', { ...pos, permissionConfig: newConfig });
  };

  const renderToggle = (title: string, type: string, name: string) => {
    return (
      <FormGroup>
        <ControlLabel>{title}</ControlLabel>
        <Toggle
          id={`${type}${name}`}
          name={`${type}.${name}`}
          checked={config[type] && config[type][name] ? true : false}
          onChange={onChangeValue}
          icons={{
            checked: <span>Yes</span>,
            unchecked: <span>No</span>,
          }}
        />
      </FormGroup>
    );
  };

  const renderDiscountInput = (title: string, type: string, name: string) => {
    if (!(config[type] && config[type][name])) return null;

    return (
      <FormGroup>
        <ControlLabel>{title}</ControlLabel>
        <FormControl
          id={`${type}${name}`}
          name={`${type}.${name}Limit`}
          defaultValue={config[type] && config[type][`${name}Limit`]}
          onChange={(e) => onChangeValue(e, 'value')}
          max={100}
        />
      </FormGroup>
    );
  };

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
              {renderToggle('Is Print Temp Bill', 'admins', 'isTempBill')}
              {renderToggle('Direct discount', 'admins', 'directDiscount')}
              {renderDiscountInput(
                'Direct discount limit',
                'admins',
                'directDiscount',
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
              {renderToggle('Is Print Temp Bill', 'cashiers', 'isTempBill')}
              {renderToggle('Direct Discount', 'cashiers', 'directDiscount')}
              {renderDiscountInput(
                'Direct discount limit',
                'cashiers',
                'directDiscount',
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
};

export default Permission;
