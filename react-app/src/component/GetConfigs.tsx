import React from 'react';
import { IPaymentConfigDocument } from '../types';
import { PAYMENT_OPTIONS } from './PaymentOptions'
import Modal from './common/modal';

type Props = {
  paymentConfigs?: IPaymentConfigDocument[]
}

class GetConfigs extends React.Component<Props> {
  constructor(props: any) {
    super(props);
  }

  render() {
    const { paymentConfigs } = this.props;
    console.log("paymentConfigs on component1: ", paymentConfigs, PAYMENT_OPTIONS);
    return (
      // <div>
      //   <p>You clicked times1</p>
      //   <button >
      //     Click mee
      //   </button>
      // </div>

      <Modal />
    );
  }
}

export default GetConfigs;
