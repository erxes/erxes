import React from 'react';
// erxes
import Button from '@erxes/ui/src/components/Button';
import FormControl from '@erxes/ui/src/components/form/Control';
import FormGroup from '@erxes/ui/src/components/form/Group';
import FormLabel from '@erxes/ui/src/components/form/Label';
import Tip from '@erxes/ui/src/components/Tip';
import Toggle from '@erxes/ui/src/components/Toggle';
import { __ } from '@erxes/ui/src/utils';
import { FlexItem, LeftItem } from '@erxes/ui/src/components/step/styles';
// local
import DiscountInput from '../form/DiscountInput';
import { Table } from '../../../styles';
import { PricingPlan } from '../../../types';
import { RULE_OPTIONS, DISCOUNT_OPTIONS } from '../../../constants';

type Props = {
  formValues: PricingPlan;
  handleState: (key: string, value: any) => void;
};

export default function Price(props: Props) {
  const { formValues, handleState } = props;

  // Functions
  const handleChange = (index: number, key: string, value: any) => {
    const temp = [...formValues.priceRules];
    temp[index][key] = value;

    handleState('priceRules', [...temp]);
  };

  const handleAdd = () => {
    const temp = [...formValues.priceRules];
    temp.push({ type: 'exact', discountType: 'default' });
    handleState('priceRules', [...temp]);
  };

  const handleDelete = (index: number) => {
    const temp = [...formValues.priceRules];
    if (temp.length >= 1) temp.splice(index, 1);
    handleState('priceRules', [...temp]);
  };

  const renderRow = (item: any, index: number) => {
    return (
      <tr key={'price' + item}>
        <td>
          <FormGroup>
            <FormControl
              name="type"
              componentClass="select"
              options={RULE_OPTIONS}
              onChange={(e: any) => handleChange(index, 'type', e.target.value)}
              value={item.type || 'exact'}
            />
          </FormGroup>
        </td>
        <td>
          <FormGroup>
            <FormControl
              name="value"
              type="number"
              placeholder={__('0.00$')}
              onChange={(e: any) =>
                handleChange(index, 'value', parseFloat(e.target.value))
              }
              value={item.value || ''}
              required
            />
          </FormGroup>
        </td>
        <td>
          <FormGroup>
            <FormControl
              name="discountType"
              componentClass="select"
              options={DISCOUNT_OPTIONS}
              onChange={(e: any) =>
                handleChange(index, 'discountType', e.target.value)
              }
              value={item.discountType || 'default'}
            />
          </FormGroup>
        </td>
        <td>
          <DiscountInput
            type={item.discountType}
            value={item.discountValue}
            handleChange={(value: number) =>
              handleChange(index, 'discountValue', value)
            }
            bonusValue={item.discountBonusProduct}
            handleBonusChange={(value: any) =>
              handleChange(index, 'discountBonusProduct', value)
            }
          />
        </td>
        <td>
          <FormGroup>
            <FormControl
              name="priceAdjustType"
              componentClass="select"
              options={[
                {
                  label: 'None',
                  value: 'none'
                },
                {
                  label: 'Default',
                  value: 'default'
                },
                {
                  label: 'Round',
                  value: 'round'
                },
                {
                  label: 'Floor',
                  value: 'floor'
                },
                {
                  label: 'Ceil',
                  value: 'ceil'
                },
                {
                  label: 'Ends With 9',
                  value: 'endsWith9'
                }
              ]}
              onChange={(e: any) =>
                handleChange(index, 'priceAdjustType', e.target.value)
              }
              defaultValue={item.priceAdjustType}
            />
          </FormGroup>
        </td>
        <td>
          <FormGroup>
            <FormControl
              type="number"
              name="value"
              placeholder="0"
              required={true}
              onChange={(e: any) =>
                handleChange(
                  index,
                  'priceAdjustFactor',
                  parseFloat(e.target.value)
                )
              }
              defaultValue={item.priceAdjustFactor}
            />
          </FormGroup>
        </td>
        <td>
          <Tip text={__('Delete')} placement="bottom">
            <Button
              btnStyle="danger"
              icon="trash"
              size="small"
              onClick={() => handleDelete(index)}
            />
          </Tip>
        </td>
      </tr>
    );
  };

  const renderTable = () => {
    if (formValues.isPriceEnabled)
      return (
        <>
          <Table>
            <thead>
              <tr>
                <th>{__('Rule type')}</th>
                <th>{__('Rule value')}</th>
                <th>{__('Discount type')}</th>
                <th>{__('Discount value')}</th>
                <th>{__('Price adjust type')}</th>
                <th>{__('Price adjust factor')}</th>
                <th>{__('Actions')}</th>
              </tr>
            </thead>
            <tbody>
              {(formValues.priceRules || []).map((item: any, index: number) =>
                renderRow(item, index)
              )}
            </tbody>
          </Table>
          <div style={{ display: 'block', textAlign: 'right' }}>
            <Button
              btnStyle="success"
              icon="plus"
              size="small"
              onClick={handleAdd}
            >
              {__('Add row')}
            </Button>
          </div>
        </>
      );

    return;
  };

  return (
    <FlexItem>
      <LeftItem>
        <FormGroup>
          <FormLabel>{__('Enable price rule')}</FormLabel>
          <Toggle
            defaultChecked={formValues.isPriceEnabled}
            onChange={(event: any) =>
              handleState('isPriceEnabled', event.target.checked)
            }
          />
        </FormGroup>
        {renderTable()}
      </LeftItem>
    </FlexItem>
  );
}
