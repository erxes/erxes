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
  description?: string;
  paymentConfigId: string;
};

type State = {
  invoiceNo: string;
  amount: string;
  qr: string;
  qrInvoiceNo: string;
  description: string;
  qrPaymentStatus: string;
  type: string;
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
      qrPaymentStatus: 'CREATED',
      type: 'qpay'
    };
  }

  checkInvoice = () => {
    const { qrInvoiceNo } = this.state;
    client
      .query({
        query: gql(queries.checkInvoice),
        fetchPolicy: 'network-only',
        variables: {
          invoiceId: qrInvoiceNo,
          paymentId: this.props.paymentConfigId
        }
      })
      .then(async response => {
        const data = response.data.checkInvoice;
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
    const { paymentConfigId } = this.props;
    this.setState({ qr: '', qrInvoiceNo: '' });

    client
      .mutate({
        mutation: gql(mutations.createInvoice),
        variables: {
          paymentId: paymentConfigId,
          amount: Number(this.state.amount),
          description: this.state.description,
          phone: '',
          customerId: '',
          companyId: ''
        }
      })
      .then(async response => {
        const data = response.data.createInvoice;
        const invoice = data[0];

        if (!invoice.error) {
          QRCode.toDataURL(invoice.response.qr_text).then(qrImage => {
            this.setState({
              qr: qrImage,
              qrInvoiceNo: invoice.response.invoice_id
            });
          });
        } else {
          alert(invoice.error);
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
          <FormWrapper>
            <FormColumn>
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
                  Create invoice
                </Button>
              </QpayButtonStyle>
            </FormColumn>
            <FormColumn>
              {qrInvoiceNo !== '' && (
                <>
                  <QpayImageStyle>
                    <img src={this.state.qr} width="150px" />
                  </QpayImageStyle>
                  <FormGroup>
                    <ControlLabel>
                      Status: {this.state.qrPaymentStatus}
                    </ControlLabel>
                  </FormGroup>
                  <FormGroup>
                    <ControlLabel>Qpay InvoiceNo</ControlLabel>
                    <FormControl
                      value={this.state.qrInvoiceNo}
                      required={true}
                    />
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

export default QpaySection;
