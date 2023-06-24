import FormGroup from '@erxes/ui/src/components/form/Group';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import { IOption } from '@erxes/ui/src/types';
import { __ } from '@erxes/ui/src/utils';
import React from 'react';
import Select from 'react-select-plus';
import styled from 'styled-components';

import { IPaymentDocument } from '../types';

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
  payments: IPaymentDocument[];
  isRequired?: boolean;
  description?: string;
  defaultValue?: string[];
  onChange: (value: string[]) => void;
};

class SelectPayments extends React.Component<Props, {}> {
  generateOptions(array: IPaymentDocument[] = []): IOption[] {
    return array.map(item => {
      const payment = item || ({} as IPaymentDocument);

      return {
        value: payment._id,
        label: `${payment.kind}: ${payment.name}`
      };
    });
  }

  onChangePayment = values => {
    const { onChange } = this.props;

    onChange(values.map(item => item.value) || []);
  };

  render() {
    const { payments, defaultValue } = this.props;

    return (
      <FormGroup>
        <ControlLabel required={this.props.isRequired}>Payments</ControlLabel>
        <p>
          {' '}
          {this.props.description
            ? this.props.description
            : __('Select payments that you want to use ')}
        </p>
        <Row>
          <LeftContent>
            <Select
              placeholder={__('Select payments')}
              value={defaultValue}
              onChange={this.onChangePayment}
              options={this.generateOptions(payments)}
              multi={true}
            />
          </LeftContent>
        </Row>
      </FormGroup>
    );
  }
}

export default SelectPayments;
