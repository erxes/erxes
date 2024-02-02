import SelectCompanies from '@erxes/ui-contacts/src/companies/containers/SelectCompanies';
import FormControl from '@erxes/ui/src/components/form/Control';
import React from 'react';
import { CompanyProductConfig } from '../../../gql/types';
import Button from '@erxes/ui/src/components/Button';
import { FlexRow } from '../../../styles';
import { TravelProductConfig } from '../types';

type Props = {
  config: TravelProductConfig;
  index: number;
  onChange: (index: number, productConfig: TravelProductConfig) => void;
  remove: (index: number) => void;
};

const DURATION_OPTIONS = [
  { value: 4, label: '4 days' },
  { value: 7, label: '7 days' },
  { value: 8, label: '8 days' },
  { value: 10, label: '10 days' },
  { value: 14, label: '14 days' },
  { value: 21, label: '21 days' },
  { value: 31, label: '31 days' },
  { value: 45, label: '45 days' },
  { value: 65, label: '65 days' },
  { value: 92, label: '92 days' },
  { value: 182, label: '6 months' },
  { value: 273, label: '9 months' },
  { value: 365, label: 'Annual' },
];

const GROUP_OPTIONS = [
  { value: '10', label: 'group of 1-10' },
  { value: '20', label: 'group of 11-20' },
  { value: '30', label: 'group of 21-30' },
  { value: '40', label: 'group of 31-40' },
  { value: '50', label: 'group of 41-50' },
  { value: '60', label: 'group of 51-60' },
];

const Row = (props: Props) => {
  const { config } = props;

  const onChangeInput = (e: any) => {
    const { id, value } = e.target;
    console.log(id, value);

    // if (id === 'price') {
    //   props.onChange(props.index, {
    //     ...config,
    //     price: value,
    //   });
    // }

    props.onChange(props.index, {
      ...config,
      [id]: Number(value),
    });
  };

  const remove = () => {
    props.remove(props.index);
  };

  return (
    <FlexRow>
      <FormControl
        id="duration"
        componentClass="select"
        placeholder="Duration"
        value={config.duration}
        onChange={onChangeInput}
      >
        {DURATION_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </FormControl>

      <FormControl
        id="numberOfPeople"
        componentClass="select"
        placeholder="Number of people in a group"
        value={config.numberOfPeople}
        onChange={onChangeInput}
      >
        {GROUP_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </FormControl>

      <FormControl
        id="price"
        componentClass="Input"
        placeholder="Price"
        value={config.price}
        type="number"
        onChange={onChangeInput}
      />

      <Button onClick={remove} btnStyle="danger" icon="times" />
    </FlexRow>
  );
};

export default Row;
