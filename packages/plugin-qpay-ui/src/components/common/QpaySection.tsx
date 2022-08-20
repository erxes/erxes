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
  description?: string;
};

type State = {
  invoiceNo: string;
  amount: string;
  qr: string;
  qrInvoiceNo: string;
  description: string;
  qrPaymentStatus: string;
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
class QpaySection extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    const { invoiceNo, amount, description } = props;

    this.state = {
      invoiceNo: invoiceNo ? invoiceNo : defaultInvoiceNo(16),
      amount: amount ? amount : '0',
      qr: '',
      qrInvoiceNo: '',
      description: description ? description : 'Qpay invoice',
      qrPaymentStatus: 'CREATED'
    };
  }

  checkInvoice = () => {
    client
      .query({
        query: gql(queries.getQpayInvoiceDetails),
        fetchPolicy: 'network-only',
        variables: {
          invoiceId: this.state.qrInvoiceNo
        }
      })
      .then(async response => {
        const data = response.data.getQpayInvoiceDetails;
        if (!data.error) {
          this.setState({ qrPaymentStatus: data.invoice_status });
        } else {
          alert(data.error.amount.message);
        }
      })
      .catch(error => {
        alert(error);
      });
  };

  createQpay = () => {
    this.setState({ qr: '', qrInvoiceNo: '' });

    client
      .mutate({
        mutation: gql(mutations.createInvoice),
        variables: {
          sender_invoice_no_auto: false,
          sender_invoice_no: this.state.invoiceNo,
          invoice_receiver_code: 'terminal',
          invoice_description: this.state.description,
          amount: this.state.amount
        }
      })
      .then(async response => {
        const data = response.data.createQpaySimpleInvoice;
        if (!data.error) {
          QRCode.toDataURL(data.qr_text).then(qrImage => {
            this.setState({ qr: qrImage, qrInvoiceNo: data.invoice_id });
          });
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

  onClickEvent = () => {
    this.setState({ invoiceNo: defaultInvoiceNo(16), qr: '', qrInvoiceNo: '' });
  };

  render() {
    const { qrInvoiceNo } = this.state;

    return (
      <Box title={__('Qpay')} name="showQpay" isOpen={true}>
        <QpaySectionStyle>
          <FormGroup>
            <ControlLabel required={true}>Sender invoiceNo</ControlLabel>

            <button onClick={this.onClickEvent}>
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
            <ControlLabel required={true}>Description</ControlLabel>
            <FormControl
              defaultValue={this.state.description}
              onChange={this.onChangeEvent.bind(this, 'description')}
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
              onClick={this.createQpay}
              uppercase={false}
            >
              Invoice
            </Button>
          </QpayButtonStyle>
          {qrInvoiceNo !== '' && (
            <>
              <QpayImageStyle>
                <img src={this.state.qr} width="90%" />
              </QpayImageStyle>
              <FormGroup>
                <ControlLabel>
                  Status: {this.state.qrPaymentStatus}
                </ControlLabel>
              </FormGroup>
              <FormGroup>
                <ControlLabel>Qpay InvoiceNo</ControlLabel>
                <FormControl value={this.state.qrInvoiceNo} required={true} />
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

export default QpaySection;
