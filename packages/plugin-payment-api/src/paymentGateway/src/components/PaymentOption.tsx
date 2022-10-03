import { Component } from 'react';

import { PAYMENTS } from '../constants';
import { IInvoice, IPaymentParams } from '../types';
import QpaySection from './Qpay';
import SocialPaySection from './SocialPay';
import * as React from 'react';

type Props = {
  handleClose: any;
  params: IPaymentParams;
  show: boolean;
  datas: any[];
  isLoading: boolean;
  paymentConfigId?: string;
  invoice?: IInvoice;
  onClickInvoiceCreate: (
    paymentConfigId: string,
    params: IPaymentParams
  ) => void;
  onClickCheck: () => void;
};

type State = {
  id: string;
  description: string;
  amount: number;
  phone: string;
};

class Payment extends Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      id: (props.paymentConfigId && props.paymentConfigId) || '',
      description: (props.params.description && props.params.description) || '',
      amount: (props.params.amount && props.params.amount) || 0,
      phone: props.params.phone || ''
    };
  }

  onChange = (key: string, value: any) => {
    this.setState({ [key]: value } as any);
  };

  onClick = (id: string) => {
    this.setState({ id });
    const { params, onClickInvoiceCreate } = this.props;

    onClickInvoiceCreate(id, { ...params, ...this.state });
  };

  onClickContinue = (e: any) => {
    const { id } = this.state;
    const { params, onClickInvoiceCreate } = this.props;

    return onClickInvoiceCreate(id, { ...params, ...this.state });
  };

  onClickCheck = () => {
    this.props.onClickCheck();
  };

  imageRender = (url: string, name: string, paymentConfigId: string) => {
    const { id } = this.state;
    const checked = id === paymentConfigId ? true : false;

    return (
      <div
        key={paymentConfigId}
        className="grid-sub-container"
        onClick={this.onClick.bind(this, paymentConfigId)}
      >
        <div className="grid-radio-item">
          <input
            type="radio"
            name="payment"
            checked={checked}
            onChange={this.onClick.bind(this, paymentConfigId)}
          />
        </div>
        <div className="grid-image-item">
          <img src={url} alt="payment config" width="100px" />
        </div>
        <div className="grid-name-item">{name}</div>
      </div>
    );
  };

  paymentOptionRender = (datas: any[]) => {
    const { id } = this.state;

    const paymentData = id ? datas.find(d => d._id === id) : null;
    const type = paymentData ? paymentData.type : null;

    const updatedProps = {
      ...this.props,
      phone: this.state.phone,
      onChange: this.onChange
    };

    return (
      <div className="grid-container">
        <div className="grid-item">
          <div style={{ height: '30em', overflow: 'auto' }}>
            {datas.map((data: any) => {
              const paymentConstant = PAYMENTS.find(p => p.type === data.type);

              return this.imageRender(
                paymentConstant ? paymentConstant.logo : '',
                data.name,
                data._id
              );
            })}
          </div>
        </div>
        <div className="grid-item">
          {this.props.isLoading && <div>Loading...</div>}

          {id && type === 'qpay' && <QpaySection {...updatedProps} />}
          {id && type === 'socialPay' && <SocialPaySection {...updatedProps} />}

          <div className="border">
            <div>
              <label className="label" htmlFor="amount">
                Amount:{' '}
              </label>
              <p>{this.props.params.amount}</p>
            </div>

            {this.props.params.phone && type === 'socialPay' && (
              <div>
                <label className="label" htmlFor="phone">
                  Phone:{' '}
                </label>
                <p>{this.props.params.phone}</p>
              </div>
            )}
          </div>

          {this.props.invoice && (
            <input
              id="check"
              type="submit"
              value="check"
              onClick={this.onClickCheck}
            />
          )}
        </div>
      </div>
    );
  };

  render() {
    const { show, datas } = this.props;
    const showHideClassName = show
      ? 'modal display-block'
      : 'modal display-none';

    return (
      <div className={showHideClassName}>
        <section className="modal-main">
          {this.paymentOptionRender(datas)}
        </section>
      </div>
    );
  }
}

export default Payment;
