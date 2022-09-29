import { Component } from "react";

import { PAYMENTS } from "../constants";
import { IPaymentParams } from "../types";
import QpaySection from "./Qpay";
import SocialPaySection from "./SocialPay";

type Props = {
  handleClose: any;
  params: IPaymentParams;
  show: boolean;
  datas: any[];
  paymentId?: string;
  invoice?: any;
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
      id: (props.paymentId && props.paymentId) || "",
      description: (props.params.description && props.params.description) || "",
      amount: (props.params.amount && props.params.amount) || 0,
      phone: props.params.phone || ""
    };
  }

  onChange = (key: string, value: any) => {
    this.setState({ [key]: value } as any);
  };

  onClick = (id: string) => {
    this.setState({ id });
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

  renderButtons = () => {
    const { invoice } = this.props;

    if (!this.state.id) {
      return null;
    }

    if (invoice && invoice.status === "open") {
      return (
        <input
          id="check"
          type="submit"
          value="check"
          onClick={this.onClickCheck}
        />
      );
    }

    return (
      <input
        id="create"
        type="submit"
        value="continue"
        onClick={this.onClickContinue}
      />
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
          <div style={{ height: "30em", overflow: "auto" }}>
            {datas.map((data: any) => {
              const paymentConstant = PAYMENTS.find(p => p.type === data.type);

              return this.imageRender(
                paymentConstant ? paymentConstant.logo : "",
                data.name,
                data._id
              );
            })}
          </div>
        </div>
        <div className="grid-item">
          {id && type === "qpay" && <QpaySection {...updatedProps} />}
          {id && type === "socialPay" && <SocialPaySection {...updatedProps} />}
          {this.renderButtons()}
        </div>
      </div>
    );
  };

  render() {
    const { show, datas } = this.props;
    const showHideClassName = show
      ? "modal display-block"
      : "modal display-none";

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
