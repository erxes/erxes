import FormGroup from '@erxes/ui/src/components/form/Group';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import { IOption } from '@erxes/ui/src/types';
import { __ } from '@erxes/ui/src/utils';
import React from 'react';
import Select from 'react-select-plus';
import styled from 'styled-components';

import { IPaymentConfig } from '../types';

const LeftContent = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
`;

const Row = styled.div`
  display: flex;

  .Select {
    flex: 1;
  }

  button {
    flex-shrink: 0;
    margin-left: 10px;
    align-self: baseline;
  }
`;

type Props = {
  payments: IPaymentConfig[];
  onChange?: (values: string[]) => any;
  defaultValue?: string[];
  isRequired?: boolean;
  description?: string;
};

class SelectPayments extends React.Component<Props, {}> {
  generateUserOptions(array: IPaymentConfig[] = []): IOption[] {
    return array.map(item => {
      const payment = item || ({} as IPaymentConfig);

      return {
        value: payment._id,
        label: `${payment.kind}: ${payment.name}`
      };
    });
  }

  onChangePayment = values => {
    if (this.props.onChange) {
      this.props.onChange(values.map(item => item.value) || []);
    }
  };

  render() {
    const {
      payments,
      defaultValue,
      isRequired,
      description = __('Select payments that you want to use ')
    } = this.props;

    return (
      <FormGroup>
        <ControlLabel required={isRequired}>Payments</ControlLabel>
        <p>{description}</p>
        <Row>
          <LeftContent>
            <Select
              placeholder={__('Select payments')}
              value={defaultValue}
              onChange={this.onChangePayment}
              options={this.generateUserOptions(payments)}
              multi={true}
            />
          </LeftContent>
        </Row>
      </FormGroup>
    );
  }
}

export default SelectPayments;
