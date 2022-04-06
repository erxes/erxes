import React from "react";
import dayjs from "dayjs";
import { HeaderWrapper } from "../../styles";

type Props = {
  response: any;
  // logo: string;
  // name: string;
};

export default class Header extends React.Component<Props> {
  renderField(text, data) {
    if (text && data) {
      return (
        <p>
          <b>{text}:</b> {data}
        </p>
      );
    }

    return null;
  }

  renderCustomer(customer?) {
    if (!customer) {
      return null;
    }

    return (
      <p className="customer">
        <b>Харилцагч:</b>
        {customer.code ? <span>Код: {customer.code}</span> : null}
        <span>Нэр: {customer.firstName}</span>
      </p>
    );
  }

  renderWorker(worker) {
    if (!worker) {
      return null;
    }

    return (
      <p className="worker">
        <b>Ажилтан: </b>
        <span>{worker.details ? worker.details.fullName : worker.email}</span>
      </p>
    );
  }

  render() {
    const { response } = this.props;

    return (
      <HeaderWrapper className="block">
        <div className="receipt-logo">
          <img src={'logo'} width={'32px'} height={'32px'} />
          <h5><b>{'TTTTTTTTTTT'}</b></h5>
          <h2><b>&#8470;:</b>{response.number.split("_")[1]}</h2>
        </div>
        <div className="header">
          <p>
            <b>Огноо:</b>
            {response.paidDate ? (
              <span>{dayjs(response.paidDate).format("YYYY.MM.DD HH:mm")}</span>
            ) : null}
          </p>
          {this.renderWorker(response.user)}

          {this.renderCustomer(response.customer)}
          <div className="clearfix" />
        </div>
      </HeaderWrapper>
    );
  } // end render()
}
