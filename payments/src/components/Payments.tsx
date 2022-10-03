import { Component } from 'react';

import { IInvoice, IPaymentParams } from '../types';
import PaymentOption from './PaymentOption';

type Props = {
  datas: any[];
  params: IPaymentParams;
  isLoading: boolean;
  invoice?: IInvoice;
  onClickInvoiceCreate: (
    paymentConfigId: string,
    params: IPaymentParams
  ) => void;
  onClickCheck: () => void;
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
    const { datas, params, invoice, isLoading } = this.props;
    const { show } = this.state;

    const updatedProps = {
      ...this.props,
      show,
      handleClose: this.hideModal,
      datas,
      params,
      invoice
    };

    if (invoice && invoice.status === "paid") {
      if (window.confirm("Payment process is completed.")) {
        if (params.redirectUri) {
          return (window.location.href = params.redirectUri);
        }

        window.close();
      }
    }

    return <PaymentOption {...updatedProps} />;
  }
}

export default Payments;
