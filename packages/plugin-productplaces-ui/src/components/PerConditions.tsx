import SelectProductCategory from '@erxes/ui-products/src/containers/SelectProductCategory';
import SelectProducts from '@erxes/ui-products/src/containers/SelectProducts';
import SelectSegments from '@erxes/ui-segments/src/containers/SelectSegments';
import { GroupWrapper } from '@erxes/ui-segments/src/styles';
import {
  Button,
  ControlLabel,
  FormControl,
  FormGroup,
  Tip
} from '@erxes/ui/src/components';
import { FormColumn, FormWrapper } from '@erxes/ui/src/styles/main';
import SelectBranches from '@erxes/ui/src/team/containers/SelectBranches';
import SelectDepartments from '@erxes/ui/src/team/containers/SelectDepartments';
import { __ } from '@erxes/ui/src/utils';
import React from 'react';
import { LittleGroup } from '../styles';

type Props = {
  condition: any;
  onChange: (id: string, condition: any) => void;
  onRemove: (id: string) => void;
};

type State = {};

class PerConditions extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {};
  }

  onChangeConfig = (code: string, value) => {
    const { condition, onChange } = this.props;
    onChange(condition.id, { ...condition, [code]: value });
  };

  onChange = (name, value) => {
    this.onChangeConfig(name, value);
  };

  onChangeInput = (code: string, e) => {
    this.onChangeConfig(code, e.target.value);
  };

  render() {
    const { condition } = this.props;
    return (
      <GroupWrapper>
        <FormWrapper>
          <FormColumn>
            <FormGroup>
              <ControlLabel>{'Product Category'}</ControlLabel>
              <SelectProductCategory
                label="Choose product category"
                name="productCategoryIds"
                initialValue={condition.productCategoryIds || ''}
                customOption={{
                  value: '',
                  label: '...Clear product category filter'
                }}
                onSelect={categoryIds =>
                  this.onChange('productCategoryIds', categoryIds)
                }
                multi={true}
              />
            </FormGroup>
            <FormGroup>
              <ControlLabel>{__('Exclude categories')}</ControlLabel>
              <SelectProductCategory
                name="excludeCategoryIds"
                label="Choose categories to exclude"
                initialValue={condition.excludeCategoryIds}
                onSelect={categoryIds =>
                  this.onChange('excludeCategoryIds', categoryIds)
                }
                multi={true}
              />
            </FormGroup>
            <FormGroup>
              <ControlLabel>{__('Exclude products')}</ControlLabel>
              <SelectProducts
                name="excludeProductIds"
                label="Choose products to exclude"
                initialValue={condition.excludeProductIds}
                onSelect={productIds =>
                  this.onChange('excludeProductIds', productIds)
                }
                multi={true}
              />
            </FormGroup>
            <FormGroup>
              <ControlLabel>{__('Segment')}</ControlLabel>
              <SelectSegments
                name="segments"
                label="Choose segments"
                contentTypes={['products:product']}
                initialValue={condition.segments}
                multi={true}
                onSelect={segmentIds => this.onChange('segments', segmentIds)}
              />
            </FormGroup>
          </FormColumn>

          <FormColumn>
            <FormGroup>
              <ControlLabel>{'Low Count'}</ControlLabel>
              <FormControl
                defaultValue={condition.ltCount}
                onChange={this.onChangeInput.bind(this, 'ltCount')}
                required={true}
                autoFocus={true}
              />
            </FormGroup>
            <FormGroup>
              <ControlLabel>{'Great Count'}</ControlLabel>
              <FormControl
                defaultValue={condition.gtCount}
                onChange={this.onChangeInput.bind(this, 'gtCount')}
                required={true}
                autoFocus={true}
              />
            </FormGroup>
            <FormGroup>
              <ControlLabel>{'Low UnitPrice'}</ControlLabel>
              <FormControl
                defaultValue={condition.ltUnitPrice}
                onChange={this.onChangeInput.bind(this, 'ltUnitPrice')}
                required={true}
                autoFocus={true}
              />
            </FormGroup>
            <FormGroup>
              <ControlLabel>{'Great UnitPrice'}</ControlLabel>
              <FormControl
                defaultValue={condition.gtUnitPrice}
                onChange={this.onChangeInput.bind(this, 'gtUnitPrice')}
                required={true}
                autoFocus={true}
              />
            </FormGroup>
            <FormGroup>
              <ControlLabel>{'Sub uom type'}</ControlLabel>
              <FormControl
                componentClass="select"
                defaultValue={condition.subUomType}
                options={[
                  { label: 'Not use', value: '' },
                  { label: 'Low than count', value: 'lt' },
                  { label: 'Greater, equal than count', value: 'gte' }
                ]}
                onChange={(e: any) => {
                  this.onChange('subUomType', e.target.value);
                }}
              />
            </FormGroup>
          </FormColumn>
        </FormWrapper>
        <LittleGroup>
          <FormWrapper>
            <FormColumn>
              <ControlLabel>{'Set branch'}</ControlLabel>
              <SelectBranches
                label="Choose Branch"
                name="branchId"
                initialValue={condition.branchId}
                onSelect={branchId => this.onChange('branchId', branchId)}
                multi={false}
                customOption={{ value: '', label: 'Clean branch' }}
              />
            </FormColumn>
            <FormColumn>
              <ControlLabel>{'Set department'}</ControlLabel>
              <SelectDepartments
                label="Choose department"
                name="selectedDepartmentIds"
                initialValue={condition.departmentId}
                onSelect={departmentId =>
                  this.onChange('departmentId', departmentId)
                }
                multi={false}
                customOption={{ value: '', label: 'Clean department' }}
              />
            </FormColumn>
          </FormWrapper>
        </LittleGroup>
        <Tip text={'Delete'}>
          <Button
            btnStyle="simple"
            size="small"
            onClick={this.props.onRemove.bind(this, condition.id)}
            icon="times"
          />
        </Tip>
      </GroupWrapper>
    );
  }
}
export default PerConditions;
