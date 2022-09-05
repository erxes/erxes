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
import { QpaySectionStyle, QpayButtonStyle, QpayImageStyle } from '../styles';
import QRCode from 'qrcode';
import { FormColumn, FormWrapper } from '@erxes/ui/src/styles/main';

type Props = {
  invoiceNo?: string;
  amount?: string;
  phone?: string;
  paymentConfigId: string;
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
        query: gql(queries.checkInvoice),
        fetchPolicy: 'network-only',
        variables: {
          invoiceId: this.state.invoiceNo,
          paymentId: this.props.paymentConfigId
        }
      })
      .then(async response => {
        const data = response.data.checkInvoice;
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
    const { paymentConfigId } = this.props;
    this.setState({ qr: '', spPaymentStatus: '' });

    const variables = {
      paymentId: paymentConfigId,
      amount: Number(this.state.amount),
      phone: this.state.phone,
      description: 'socialPay',
      customerId: '',
      companyId: ''
    };

    client
      .mutate({
        mutation: gql(mutations.createInvoice),
        variables
      })
      .then(async response => {
        const { withPhone } = this.state;

        const invoiceResponse = response.data.createInvoice;

        if (!invoiceResponse.error) {
          this.setState({
            spPaymentStatus: 'created'
          });

          console.log(invoiceResponse, withPhone);

          if (!withPhone) {
            console.log(invoiceResponse[0]);
            const invoice = invoiceResponse[0];

            const qrText = invoice.data.qr ? invoice.data.qr : '';

            QRCode.toDataURL(qrText).then(data => {
              console.log('QRCode.toDataURL:', invoice.data.invoiceNo, qrText);

              this.setState({ qr: data, invoiceNo: invoice.data.invoiceNo });
            });
          }
        } else {
          alert(invoiceResponse.error);
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

      if (variable === 'withPhone' && e.target.checked === false) {
        this.setState({ phone: '' });
      }
    }
  };

  render() {
    const { spPaymentStatus } = this.state;

    return (
      <Box title={__('SocialPay')} name="showSocialPay" isOpen={true}>
        <QpaySectionStyle>
          <FormWrapper>
            <FormColumn>
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
                  Create invoice
                </Button>
              </QpayButtonStyle>
            </FormColumn>
            <FormColumn>
              {spPaymentStatus !== '' && (
                <>
                  {this.state.withPhone === false && (
                    <QpayImageStyle>
                      <img src={this.state.qr} width="150pxs" />
                    </QpayImageStyle>
                  )}
                  <FormGroup>
                    <ControlLabel>
                      Status: {this.state.spPaymentStatus}
                    </ControlLabel>
                  </FormGroup>
                  <FormGroup>
                    <ControlLabel>SocialPay InvoiceNo</ControlLabel>
                    <FormControl value={this.state.invoiceNo} required={true} />
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
            </FormColumn>
          </FormWrapper>
        </QpaySectionStyle>
      </Box>
    );
  }
}

export default SocialPaySection;
