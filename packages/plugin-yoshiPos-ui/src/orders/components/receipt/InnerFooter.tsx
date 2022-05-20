import React from 'react';
import { FooterWrapper, Lottery, LotterySide } from './styles';
import Amount from './Amount';
import Button from 'modules/common/components/Button';
import { IOrder } from 'modules/orders/types';
import { __ } from 'modules/common/utils';

type Props = {
  color: string;
  order: IOrder;
};

export default class Footer extends React.Component<Props> {
  private putResponse;

  constructor(props: Props) {
    super(props);

    const { putResponses = [] } = props.order;

    // comes in descending order by createdAt
    this.putResponse = putResponses[0];
  }

  renderField(text, data) {
    if (text && data) {
      return (
        <p>
          <label>{text}:</label> {data}
        </p>
      );
    }
    return null;
  }

  renderSide() {
    const { order } = this.props;
    return (
      <LotterySide>
        <Amount order={order} />
      </LotterySide>
    );
  }

  render() {
    const { color } = this.props;
    const { billId = '' } = this.putResponse || {};

    return (
      <FooterWrapper>
        <p id="error-message" className="error-message"></p>
        <Lottery>{this.renderSide()}</Lottery>

        <p>{billId}</p>
        <p className="signature">
          <label>{__('Signature')}:</label>
          <span>_____________________</span>
        </p>
        <div className="text-center btn-print">
          <Button
            onClick={() => window.print()}
            style={{ backgroundColor: color }}
          >
            {__('Print')}
          </Button>
        </div>
      </FooterWrapper>
    );
  }

  componentDidMount() {
    if (this.putResponse) {
      window.addEventListener('afterprint', () => {
        window.close();
      });

      const {
        errorCode,
        lotteryWarningMsg,
        success,
        message,
        billId
      } = this.putResponse;
      const errorMessage = document.getElementById('error-message');

      if (errorMessage) {
        if (errorCode && message) {
          errorMessage.innerHTML = `${errorCode}: ${message}`;
        }
        if (lotteryWarningMsg) {
          errorMessage.innerHTML = lotteryWarningMsg;
        }
      }

      if (success === 'true') {
        if (billId) {
        }

        setTimeout(() => {
          window.print();
        }, 20);
      } // end qrcode
    }
  } // end componentDidMount

  componentWillUnmount() {
    window.removeEventListener('afterprint', () => {});
  }
}
