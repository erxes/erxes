import Select from 'react-select';
import React, { useState } from 'react';
import SelectDepartments from '@erxes/ui/src/team/containers/SelectDepartments';
import {
  __,
  ControlLabel,
  FormControl,
  FormGroup,
  Toggle
} from '@erxes/ui/src';
import { IPmsBranch } from '../../types';
import { LeftItem } from '@erxes/ui/src/components/step/styles';
import { Block, BlockRow, FlexColumn, FlexItem } from '../../styles';
import SelectBranches from '@erxes/ui/src/team/containers/SelectBranches';
import SelectBrands from '@erxes/ui/src/brands/containers/SelectBrands';

type Props = {
  onChange: (name: 'branch' | '', value: any) => void;
  branch: IPmsBranch;
};

const GeneralStep = (props: Props) => {
  const { branch, onChange } = props;

  let name = 'PMS name';
  let description: any = 'description';

  if (branch) {
    name = branch.name || '';
    description = branch.description;
  }

  const onChangeFunction = (name: any, value: any) => {
    onChange(name, value);
  };

  const onChangeInput = e => {
    onChangeFunction(e.target.id, (e.currentTarget as HTMLInputElement).value);
  };

  return (
    <FlexItem>
      <FlexColumn>
        <LeftItem>
          <Block>
            <h4>{__('Branch')}</h4>
            <BlockRow>
              <FormGroup>
                <ControlLabel required={true}>Name</ControlLabel>
                <FormControl
                  id='name'
                  type='text'
                  value={name || ''}
                  onChange={onChangeInput}
                />
              </FormGroup>

              <FormGroup>
                <ControlLabel>Description</ControlLabel>
                <FormControl
                  id='description'
                  type='text'
                  value={description || ''}
                  onChange={onChangeInput}
                />
              </FormGroup>

              {/* <FormGroup>
                <ControlLabel>Order Password</ControlLabel>
                <FormControl
                  id='orderPassword'
                  value={pos.orderPassword || ''}
                  onChange={onChangeInput}
                />
              </FormGroup> */}
              {/* <FormGroup>
                <ControlLabel>Brand</ControlLabel>
                <SelectBrands
                  label={__('Choose brands')}
                  onSelect={brand =>
                    onChangeFunction('pos', {
                      ...pos,
                      scopeBrandIds: [brand],
                    })
                  }
                  initialValue={pos.scopeBrandIds}
                  multi={false}
                  name='selectedBrands'
                  customOption={{
                    label: 'No Brand (noBrand)',
                    value: '',
                  }}
                />
              </FormGroup> */}
            </BlockRow>
          </Block>

          {/* <Block>
            {renderCauseOnline()}
          </Block> */}
        </LeftItem>
      </FlexColumn>
    </FlexItem>
  );
};

export default GeneralStep;
