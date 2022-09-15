import * as React from 'react';
import { IPaymentConfigDocument } from '../types';
import { PAYMENT_OPTIONS } from './PaymentOptions'

type Props = {
  paymentConfigs?: IPaymentConfigDocument[]
}

class GetConfigs extends React.Component<Props> {
  // constructor(props: any) {
  //   super(props);
  // }

  render() {
    const { paymentConfigs } = this.props;
    console.log("paymentConfigs on component1: ", paymentConfigs, PAYMENT_OPTIONS);
    return (<div> test test 123 </div>)
  }
}

export default GetConfigs;
