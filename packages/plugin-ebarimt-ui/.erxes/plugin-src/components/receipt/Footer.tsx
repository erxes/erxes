import React from "react";
import QRCode from 'qrcode';
import { FooterWrapper, Lottery, LotteryCode, LotterySide } from "./styles";
import Amount from "./Amount";
import Button from "@erxes/ui/src/components/Button";
import { __ } from "@erxes/ui/src/utils";
import JsBarcode from 'jsbarcode';

type Props = {
  response: any;
};

export default class Footer extends React.Component<Props> {
  constructor(props: Props) {
    super(props);
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
    const { response } = this.props;
    return (
      <React.Fragment>
        {response.qrData ? (
          <div className="qrcode-wrapper">
            <canvas id="qrcode" />
          </div>
        ) : null}
      </React.Fragment>
    );
  }

  renderBarCode() {
    const { response } = this.props;

    return (
      <React.Fragment>
        {response.billId ? (<canvas id="bar-code" />) : null}
      </React.Fragment>
    );
  }

  renderLotteryCode() {
    const { response } = this.props;

    if (response.billType === '3') {
      const { response } = this.props;
      return (
        <LotteryCode>
          {__("buyerCompanyNumber")}:
          <br />
          {response.registerNumber}
        </LotteryCode>
      );
    }

    return (
      response.lottery ? (
        <LotteryCode>
          {__("Lottery")}:
          <br />
          {response.lottery}
        </LotteryCode>
      ) : null
    )
  }

  renderSide() {
    const { response } = this.props;
    return (
      <LotterySide>
        <Amount response={response} />
        {this.renderLotteryCode()}
      </LotterySide>
    )
  }

  render() {
    return (
      <FooterWrapper>
        <p id="error-message" className='error-message'></p>
        <Lottery>
          {this.renderQr()}
          {this.renderSide()}
        </Lottery>
        {this.renderBarCode()}
        <p className="signature">
          <label>{__("Signature")}:</label>
          <span>_____________________</span>
        </p>
        <div className="text-center btn-print">
          <Button onClick={() => window.print()}>
            {__("Print")}
          </Button>
        </div>
      </FooterWrapper>
    );
  }

  componentDidMount() {
    const { response } = this.props;

    window.addEventListener('afterprint', () => {
      setTimeout(() => {
        window.close();
      }, 50);
    });

    const { errorCode, lotteryWarningMsg, qrData, success, message, billId } = response;
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
      }, 20)
    } // end qrcode

  } // end componentDidMount

  componentWillUnmount() {
    window.removeEventListener('afterprint', () => { });
  }
}
