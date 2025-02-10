import React, { useState } from 'react';
import {
  __,
  ControlLabel,
  FormControl,
  FormGroup,
  SelectTeamMembers,
  Toggle
} from '@erxes/ui/src';
import { IPmsBranch } from '../../types';
import { LeftItem } from '@erxes/ui/src/components/step/styles';
import { Block, BlockRow, FlexColumn, FlexItem } from '../../styles';

type Props = {
  onChange: (name: string, value: any) => void;
  branch: IPmsBranch;
};

const Permission = (props: Props) => {
  const { onChange, branch } = props;

  const [config, setConfig] = useState(branch.permissionConfig || {});

  let user1Ids: any = [];
  let user2Ids: any = [];
  let user3Ids: any = [];
  let user4Ids: any = [];
  let user5Ids: any = [];

  if (branch) {
    user1Ids = branch.user1Ids;
    user2Ids = branch.user2Ids;
    user3Ids = branch.user3Ids;
    user4Ids = branch.user4Ids;
    user5Ids = branch.user5Ids;
  }

  const onAdminSelect = users => {
    onChange('user1Ids', users);
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
            : numericValue
      }
    };

    setConfig(newConfig);

    onChange('permissionConfig', newConfig);
  };

  return (
    <FlexItem>
      <FlexColumn>
        <LeftItem>
          <Block>
            <h4>{__('Users')}</h4>

            <FormGroup>
              <ControlLabel required={true}>General manager</ControlLabel>
              <SelectTeamMembers
                label={__('Choose team member')}
                name='user1Ids'
                initialValue={user1Ids}
                onSelect={onAdminSelect}
              />
            </FormGroup>

            <FormGroup>
              <ControlLabel required={true}>managers</ControlLabel>
              <SelectTeamMembers
                label={__('Choose team member')}
                name='user2Ids'
                initialValue={user2Ids}
                onSelect={users => onChange('user2Ids', users)}
              />
            </FormGroup>
            <FormGroup>
              <ControlLabel required={true}>reservation managers</ControlLabel>
              <SelectTeamMembers
                label={__('Choose team member')}
                name='user3Ids'
                initialValue={user3Ids}
                onSelect={users => onChange('user3Ids', users)}
              />
            </FormGroup>
            <FormGroup>
              <ControlLabel required={true}>reception</ControlLabel>
              <SelectTeamMembers
                label={__('Choose team member')}
                name='user4Ids'
                initialValue={user4Ids}
                onSelect={users => onChange('user4Ids', users)}
              />
            </FormGroup>
            <FormGroup>
              <ControlLabel required={true}>housekeeper</ControlLabel>
              <SelectTeamMembers
                label={__('Choose team member')}
                name='user5Ids'
                initialValue={user5Ids}
                onSelect={users => onChange('user5Ids', users)}
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
