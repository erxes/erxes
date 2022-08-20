import {
  Box,
  FormControl,
  Button,
  FormGroup,
  ControlLabel,
  Icon
} from '@erxes/ui/src/components';
import { __ } from '@erxes/ui/src/utils';
import React from 'react';
import { mutations, queries } from '../../graphql';
import client from '@erxes/ui/src/apolloClient';
import gql from 'graphql-tag';
import {
  QpaySectionStyle,
  QpayButtonStyle,
  QpayImageStyle
} from '../../styles';
import QRCode from 'qrcode';

type Props = {
  invoiceNo?: string;
  amount?: string;
  phone?: string;
};

type State = {
  invoiceNo: string;
  amount: string;
  qr: any;
  spPaymentStatus: string;
  phone: string;
  withPhone: boolean;
};

const defaultInvoiceNo = length => {
  let result = '';
  const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};
class SocialPaySection extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    const { invoiceNo, amount, phone } = props;

    this.state = {
      invoiceNo: invoiceNo ? invoiceNo : defaultInvoiceNo(32),
      amount: amount ? amount : '0',
      qr: '',
      spPaymentStatus: '',
      phone: phone ? phone : '',
      withPhone: false
    };
  }

  checkInvoice = () => {
    client
      .query({
        query: gql(queries.checkSPInvoice),
        fetchPolicy: 'network-only',
        variables: {
          invoiceNo: this.state.invoiceNo
        }
      })
      .then(async response => {
        const data = response.data.checkSPInvoice;
        const status =
          data.header.code === 200 &&
          data.body.response.resp_desc &&
          data.body.response.resp_desc === 'Амжилттай'
            ? 'paid'
            : 'open';

        if (!data.error && data.header.code) {
          this.setState({ spPaymentStatus: status });
        } else {
          alert(data.error);
        }
      })
      .catch(error => {
        alert(error);
      });
  };

  createSocialPay = () => {
    this.setState({ qr: '', spPaymentStatus: '' });

    const mutationName = this.state.withPhone
      ? mutations.createSPInvoicePhone
      : mutations.createSPInvoiceQr;

    const variables = this.state.withPhone
      ? {
          amount: this.state.amount,
          invoiceNoAuto: false,
          invoice: this.state.invoiceNo,
          phone: this.state.phone
        }
      : {
          amount: this.state.amount,
          invoiceNoAuto: false,
          invoice: this.state.invoiceNo
        };

    client
      .mutate({
        mutation: gql(mutationName),
        variables
      })
      .then(async response => {
        const { withPhone } = this.state;

        const data = withPhone
          ? response.data.createSPInvoicePhone
          : response.data.createSPInvoiceQr;

        if (!data.error) {
          this.setState({
            spPaymentStatus: 'created'
          });

          if (!withPhone) {
            const qrText =
              data.body && data.body.response && data.body.response.desc
                ? data.body.response.desc
                : '';

            QRCode.toDataURL(qrText).then(data => {
              this.setState({ qr: data });
            });
          }
        } else {
          alert(data.error);
        }
      })
      .catch(error => {
        alert(error);
      });
  };

  onChangeEvent = (variable, e) => {
    this.setState({ ...this.state, [`${variable}`]: e.target.value });
  };

  onClickEvent = (variable, e) => {
    if (variable === 'invoiceNo') {
      this.setState({
        ...this.state,
        [`${variable}`]: defaultInvoiceNo(32),
        qr: '',
        spPaymentStatus: ''
      });
    } else {
      this.setState({ ...this.state, [`${variable}`]: e.target.checked });
    }
  };

  render() {
    const { spPaymentStatus } = this.state;

    return (
      <Box title={__('SocialPay')} name="showSocialPay" isOpen={true}>
        <QpaySectionStyle>
          <FormGroup>
            <ControlLabel>SocialPay phone</ControlLabel>
            <div style={{ width: '15px' }}>
              <FormControl
                type="checkBox"
                onClick={this.onClickEvent.bind(this, 'withPhone')}
              />
            </div>
          </FormGroup>

          {this.state.withPhone && (
            <FormGroup>
              <ControlLabel>SocialPay phone</ControlLabel>
              <FormControl
                defaultValue={this.state.phone}
                value={this.state.phone}
                onChange={this.onChangeEvent.bind(this, 'phone')}
              />
            </FormGroup>
          )}
          <FormGroup>
            <ControlLabel required={true}>Sender invoiceNo</ControlLabel>

            <button onClick={this.onClickEvent.bind(this, 'invoiceNo')}>
              <Icon icon="refresh" />
            </button>

            <FormControl
              defaultValue={this.state.invoiceNo}
              value={this.state.invoiceNo}
              onChange={this.onChangeEvent.bind(this, 'invoiceNo')}
              required={true}
            />
          </FormGroup>
          <FormGroup>
            <ControlLabel required={true}>Amount</ControlLabel>
            <FormControl
              defaultValue={this.state.amount}
              onChange={this.onChangeEvent.bind(this, 'amount')}
              required={true}
            />
          </FormGroup>
          <QpayButtonStyle>
            <Button
              btnStyle="simple"
              onClick={this.createSocialPay}
              uppercase={false}
            >
              Invoice
            </Button>
          </QpayButtonStyle>
          {spPaymentStatus !== '' && (
            <>
              {this.state.withPhone === false && (
                <QpayImageStyle>
                  <img src={this.state.qr} width="90%" />
                </QpayImageStyle>
              )}
              <FormGroup>
                <ControlLabel>
                  Status: {this.state.spPaymentStatus}
                </ControlLabel>
              </FormGroup>
              <QpayButtonStyle>
                <Button
                  btnStyle="simple"
                  onClick={this.checkInvoice}
                  uppercase={false}
                >
                  Check
                </Button>
              </QpayButtonStyle>
            </>
          )}
        </QpaySectionStyle>
      </Box>
    );
  }
}

export default SocialPaySection;
