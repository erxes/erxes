import { Component } from 'react';

import { IPaymentParams } from '../types';
import PaymentOption from './PaymentOption';

type Props = {
  datas: any[];
  params: IPaymentParams;
  invoice?: any;
  onClickInvoiceCreate: (paymentConfigId: string, params: IPaymentParams) => void;
  onClickCheck:()=>void;
};

type State = {
  show: boolean;
};
class Payments extends Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      show: true
    };
  }

  hideModal = () => {
    this.setState({ show: false });
  };

  render() {
    const { datas, params } = this.props;
    const { show } = this.state;

    const updatedProps = {
      ...this.props,
      show,
      handleClose: this.hideModal,
      datas,
      params
    };

    return <PaymentOption {...updatedProps} />;
  }
}

export default Payments;
