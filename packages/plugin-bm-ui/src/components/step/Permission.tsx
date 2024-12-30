import React, { useState } from 'react';
import {
  __,
  ControlLabel,
  FormControl,
  FormGroup,
  SelectTeamMembers,
  Toggle,
} from '@erxes/ui/src';
import { IBmsBranch } from '../../types';
import { LeftItem } from '@erxes/ui/src/components/step/styles';
import { Block, BlockRow, FlexColumn, FlexItem } from '../../styles';

type Props = {
  onChange: (name: string, value: any) => void;
  branch: IBmsBranch;
};

const Permission = (props: Props) => {
  const { onChange, branch } = props;

  const [config, setConfig] = useState(branch.permissionConfig || {});

  let user1Ids: any = [];
  let user2Ids: any = [];

  if (branch) {
    user1Ids = branch.user1Ids;
    user2Ids = branch.user2Ids;
  }

  const onAdminSelect = users => {
    onChange('user1Ids', users);
  };

  const onCashierSelect = users => {
    onChange('user2Ids', users);
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

    onChange('permissionConfig', newConfig);
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
          onChange={e => onChangeValue(e, 'value')}
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
              <ControlLabel required={true}>General manager</ControlLabel>
              <SelectTeamMembers
                label={__('Choose team member')}
                name='user1Ids'
                initialValue={user1Ids}
                onSelect={onAdminSelect}
              />
            </FormGroup>
            {/* <BlockRow>
              {renderToggle('Is Print Temp Bill', 'admins', 'isTempBill')}
              {renderToggle('Direct discount', 'admins', 'directDiscount')}
              {renderDiscountInput(
                'Direct discount limit',
                'admins',
                'directDiscount',
              )}
            </BlockRow> */}
            {/* {this.renderToggle('Set unit price', 'admins', 'setUnitPrice')} */}
          </Block>

          <Block>
            <h4>{__('managers')}</h4>
            <FormGroup>
              <ControlLabel required={true}>managers</ControlLabel>
              <SelectTeamMembers
                label={__('Choose team member')}
                name='user2ds'
                initialValue={user2Ids}
                onSelect={onCashierSelect}
              />
            </FormGroup>
            {/* <BlockRow>
              {renderToggle('Is Print Temp Bill', 'cashiers', 'isTempBill')}
              {renderToggle('Direct Discount', 'cashiers', 'directDiscount')}
              {renderDiscountInput(
                'Direct discount limit',
                'cashiers',
                'directDiscount',
              )}
            </BlockRow> */}
            {/* {this.renderToggle(
              'Set unit price',
              'cashiers',
              'setUnitPrice'
            )} */}
          </Block>
        </LeftItem>
      </FlexColumn>
    </FlexItem>
  );
};

export default Permission;
