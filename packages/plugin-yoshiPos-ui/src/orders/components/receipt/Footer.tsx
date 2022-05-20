import React from 'react';
import QRCode from 'qrcode';
import JsBarcode from 'jsbarcode';

import { FooterWrapper, Lottery, LotteryCode, LotterySide } from './styles';
import Amount from './Amount';
import Button from 'modules/common/components/Button';
import { IOrder } from 'modules/orders/types';
import { __ } from 'modules/common/utils';
import { POS_MODES } from '../../../../constants';

type Props = {
  color: string;
  order: IOrder;
  footerText: string;
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

  renderQr() {
    if (!this.putResponse) {
      return null;
    }

    return (
      <React.Fragment>
        {this.putResponse.qrData ? (
          <div className="qrcode-wrapper">
            <canvas id="qrcode" />
          </div>
        ) : null}
      </React.Fragment>
    );
  }

  renderBarCode() {
    if (!this.putResponse) {
      return null;
    }

    return (
      <React.Fragment>
        {this.putResponse.billId ? <canvas id="bar-code" /> : null}
      </React.Fragment>
    );
  }

  renderLotteryCode() {
    if (!this.putResponse) {
      return null;
    }

    if (this.putResponse.billType === '3') {
      const { order } = this.props;
      const { customerName = '' } = this.putResponse;

      return (
        <LotteryCode>
          <span>{__('buyerCompanyNumber')}:</span>
          <br />
          <span>{order.registerNumber}</span>
          {customerName && (
            <p>
              {__('Name')}: <b>{customerName}</b>
            </p>
          )}
        </LotteryCode>
      );
    }

    return this.putResponse.lottery ? (
      <LotteryCode>
        {__('Lottery')}:
        <br />
        {this.putResponse.lottery}
      </LotteryCode>
    ) : null;
  }

  renderSide() {
    const { order } = this.props;
    return (
      <LotterySide>
        <Amount order={order} />
        {this.renderLotteryCode()}
      </LotterySide>
    );
  }

  render() {
    const { color, footerText } = this.props;

    return (
      <FooterWrapper>
        <p id="error-message" className="error-message"></p>
        <Lottery>
          {this.renderQr()}
          {this.renderSide()}
        </Lottery>
        {this.renderBarCode()}
        {footerText ? (
          <div className="text-center signature">
            <label>{footerText}</label>
          </div>
        ) : (
          <p className="signature">
            <label>{__('Signature')}:</label>
            <span>_____________________</span>
          </p>
        )}
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
      const { order } = this.props;
      const mode = localStorage.getItem('erxesPosMode') || '';

      window.addEventListener('afterprint', () => {
        if (mode !== POS_MODES.KIOSK) {
          setTimeout(() => {
            const popup = window.open(
              `/order-receipt/${order._id}?inner=true`,
              '__blank'
            );
            if (!popup) {
              prompt(
                `Popup зөвшөөрөгдөөгүй байна. Дараах тохиргоог хийнэ үү. \n 1. Доорх холбоосыг copy-дох  \n 2. шинэ tab нээж, paste хийн копидсон холбоосоор орох \n 3. "Pop-ups and redirects" гэсэн хэсгийг олоод \n 4. "Allow" гэснийг сонгоно. \n 5. Үндсэн хуудасаа рефреш`,
                `chrome://settings/content/siteDetails?site=${window.location.origin}`
              );
            }
          }, 10);
        }
        setTimeout(() => {
          window.close();
        }, 50);
      });

      const {
        errorCode,
        lotteryWarningMsg,
        qrData,
        success,
        message,
        billId
      } = this.putResponse;
      const errorMessage = document.getElementById('error-message');
      const barCode = document.getElementById('bar-code');

      if (errorMessage) {
        if (errorCode && message) {
          errorMessage.innerHTML = `${errorCode}: ${message}`;
        }
        if (lotteryWarningMsg) {
          errorMessage.innerHTML = lotteryWarningMsg;
        }
      }

      if (success === 'true') {
        // draw qr code
        if (qrData) {
          const canvas = document.getElementById('qrcode');

          QRCode.toCanvas(canvas, qrData);
        }

        // draw bar code
        if (barCode && billId) {
          JsBarcode('#bar-code', billId, {
            width: 2,
            height: 30,
            fontSize: 24,
            displayValue: true,
            marginBottom: 30
          });
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
