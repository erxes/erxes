import 'abortcontroller-polyfill/dist/polyfill-patch-fetch';
import React from 'react';
import NumberFormat from 'react-number-format';

import { FlexCenter } from '../../../../common/styles/main';
import Icon from '../../../../common/components/Icon';
import FormGroup from '../../../../common/components/form/Group';
import ControlLabel from '../../../../common/components/form/Label';
import { __ } from '../../../../common/utils';
import { Input } from '../../../../orders/styles';
import { IOrder } from '../../../../orders/types';
import KeyPads from '../../drawer/KeyPads';

type Props = {
  color?: string;
  billType: string;
  order: IOrder;
  setAmount: (amount: number) => void;
  amount: number;
  maxAmount?: number;
};

type State = {
  amount: number;
};

export default class CardInput extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      amount: props.amount || props.maxAmount || 0
    };
  }

  onChangeKeyPad = num => {
    const { setAmount } = this.props;
    const { amount } = this.state;

    if (num === 'CE') {
      this.setState({ amount: 0 });

      return setAmount(0);
    }

    if (num === 'C') {
      const newAmount = parseFloat(amount.toString().slice(0, -1));
      this.setState({ amount: newAmount });
      return setAmount(newAmount);
    }

    this.setState({ amount: amount + num });

    return setAmount(amount + num);
  };

  render() {
    const { color = '', billType, setAmount, maxAmount = 0 } = this.props;

    const { amount } = this.state;

    const inputProps: any = {
      allowNegative: false,
      thousandSeparator: true,
      prefix: '₮',
      inputMode: 'numeric'
    };

    const handleInput = (value: number | undefined = 0) => {
      // do not accept amount greater than payable amount
      const val = Number((value > maxAmount ? maxAmount : value).toFixed(2));

      this.setState({ amount: val });

      setAmount(val);
    };

    const resetInput = () => {
      this.setState({ amount: 0 });

      setAmount(0);
    };

    return (
      <React.Fragment>
        <FormGroup>
          <ControlLabel>{__('QPay amount')}</ControlLabel>
          <Input color={color}>
            <NumberFormat
              name="mobileAmount"
              value={amount}
              onValueChange={values => handleInput(values.floatValue)}
              {...inputProps}
            />
            <div onClick={resetInput}>
              <Icon icon="cancel" size={13} />
            </div>
          </Input>
        </FormGroup>
        <FlexCenter>
          <KeyPads
            isPayment={false}
            isPortrait={true}
            onChangeKeyPad={this.onChangeKeyPad}
            billType={billType}
          />
        </FlexCenter>
      </React.Fragment>
    );
  } // end render()
}
