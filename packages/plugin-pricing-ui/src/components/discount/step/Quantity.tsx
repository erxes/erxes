import React from 'react';
// erxes
import Button from '@erxes/ui/src/components/Button';
import FormControl from '@erxes/ui/src/components/form/Control';
import FormGroup from '@erxes/ui/src/components/form/Group';
import FormLabel from '@erxes/ui/src/components/form/Label';
import Toggle from '@erxes/ui/src/components/Toggle';
import Tip from '@erxes/ui/src/components/Tip';
import { __ } from '@erxes/ui/src/utils';
import { FlexItem, LeftItem } from '@erxes/ui/src/components/step/styles';
// local
import DiscountInput from '../form/DiscountInput';
import { Table } from '../../../styles';
import { DiscountData } from '../../../types';
import { RULE_OPTIONS, DISCOUNT_OPTIONS } from '../../../constants';

type Props = {
  formValues: DiscountData;
  handleState: (key: string, value: any) => void;
};

export default function Quantity(props: Props) {
  const { formValues, handleState } = props;

  // Functions
  const handleChange = (index: number, key: string, value: any) => {
    const temp = [...formValues.quantityRules];
    temp[index][key] = value;

    handleState('quantityRules', [...temp]);
  };

  const handleAdd = () => {
    const temp = [...formValues.quantityRules];
    temp.push({ type: 'exact', discountType: 'default' });
    handleState('quantityRules', [...temp]);
  };

  const handleDelete = (index: number) => {
    const temp = [...formValues.quantityRules];
    if (temp.length >= 1) temp.splice(index, 1);
    handleState('quantityRules', [...temp]);
  };

  const renderRow = (item: any, index: number) => {
    return (
      <tr key={'quantity' + item}>
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
              componentClass="number"
              placeholder="Quantity"
              onChange={(e: any) =>
                handleChange(index, 'value', parseFloat(e.target.value))
              }
              value={item.value || ''}
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
    if (formValues.isQuantityEnabled)
      return (
        <>
          <Table>
            <thead>
              <tr>
                <th>{__('Rule type')}</th>
                <th>{__('Rule value')}</th>
                <th>{__('Discount type')}</th>
                <th>{__('Discount value')}</th>
                <th>{__('Actions')}</th>
              </tr>
            </thead>
            <tbody>
              {(
                formValues.quantityRules || []
              ).map((item: any, index: number) => renderRow(item, index))}
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
          <FormLabel>{__('Enable quantity rule')}</FormLabel>
          <Toggle
            defaultChecked={formValues.isQuantityEnabled}
            onChange={(event: any) =>
              handleState('isQuantityEnabled', event.target.checked)
            }
          />
        </FormGroup>
        {renderTable()}
      </LeftItem>
    </FlexItem>
  );
}
