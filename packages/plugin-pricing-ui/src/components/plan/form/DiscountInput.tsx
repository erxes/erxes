import React from 'react';
// erxes
import FormGroup from '@erxes/ui/src/components/form/Group';
import FormLabel from '@erxes/ui/src/components/form/Label';
import FormControl from '@erxes/ui/src/components/form/Control';
import SelectProducts from '@erxes/ui-products/src/containers/SelectProducts';
import { __ } from '@erxes/ui/src/utils';

type Props = {
  type: string;
  value: any;
  handleChange: (value: number) => void;
  bonusValue?: any;
  handleBonusChange?: (value: any) => void;
  isLabelOn?: boolean;
};

export default function DiscountInput(props: Props) {
  const {
    type,
    value,
    handleChange,
    bonusValue,
    handleBonusChange,
    isLabelOn = false
  } = props;
  switch (type) {
    case 'fixed':
    case 'subtraction':
      return (
        <FormGroup>
          {isLabelOn && (
            <FormLabel required={true}>{__('Discount value')}</FormLabel>
          )}
          <FormControl
            type="number"
            name="value"
            placeholder="0.00"
            defaultValue={value}
            required={true}
            onChange={(event: any) =>
              handleChange(parseFloat((event.target as HTMLInputElement).value))
            }
          />
        </FormGroup>
      );
    case 'percentage':
      if (value > 100) handleChange(100);

      return (
        <FormGroup>
          {isLabelOn && (
            <FormLabel required={true}>{__('Discount value')}</FormLabel>
          )}
          <FormControl
            type="number"
            name="value"
            placeholder="0%"
            min={0}
            max={100}
            defaultValue={value}
            required={true}
            onChange={(event: any) =>
              handleChange(parseFloat((event.target as HTMLInputElement).value))
            }
          />
        </FormGroup>
      );
    case 'bonus':
      return (
        <FormGroup>
          {isLabelOn && <FormLabel>{__('Bonus product')}</FormLabel>}
          <SelectProducts
            name="value"
            label="Choose bonus products"
            initialValue={bonusValue}
            onSelect={product =>
              handleBonusChange && handleBonusChange(product)
            }
            multi={false}
          />
        </FormGroup>
      );
    default:
      return <></>;
  }
}
