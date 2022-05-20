import 'abortcontroller-polyfill/dist/polyfill-patch-fetch';
import React from 'react';

import { __, Alert } from '../../../common/utils';
import { IOrder } from '../../../orders/types';
import { Cards, TypeWrapper } from './style';

type Props = {
  color?: string;
  onStateChange: (key: string, value: any) => void;
  billType: string;
  addOrderPayment: (params: any) => void;
  order: IOrder;
  orientation?: string;
};

type State = { sentTransaction: boolean };

export default class CardForm extends React.Component<Props, State> {
  timeoutId;
  requestCount = 0;

  constructor(props: Props) {
    super(props);

    this.state = {
      sentTransaction: false
    };
  }

  setupTimer() {
    this.timeoutId = setTimeout(() => {
      this.sendTransaction(true);
    }, 3000);
  }

  sendTransaction(isAuto = false) {
    const { order, addOrderPayment, onStateChange, billType } = this.props;
    const PATH = 'http://localhost:27028';

    this.requestCount++;

    if (
      (isAuto && this.requestCount > 20) ||
      order.totalAmount === order.cardAmount
    ) {
      clearTimeout(this.timeoutId);

      return;
    }

    fetch(`${PATH}/ajax/get-status-info`)
      .then(res => res.json())
      .then((res: any) => {
        if (res && res.status_code === 'ok') {
          // send transaction upon successful connection
          fetch(PATH, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              service_name: 'doSaleTransaction',
              service_params: {
                // special character _ is not accepted
                db_ref_no: order.number.replace('_', ''),
                amount: order.totalAmount.toString(),
                vatps_bill_type: billType
              }
            })
          })
            .then(res => res.json())
            .then(r => {
              if (r && r.status === true && r.response) {
                if (r.response.response_code === '000') {
                  Alert.success(
                    __(r.response.response_msg || 'Transaction was successful')
                  );

                  addOrderPayment({
                    _id: order._id,
                    cardInfo: r.response,
                    cardAmount: order.totalAmount
                  });

                  onStateChange('isDone', true);
                }
              }
              if (!r.status && r.response) {
                const { Exception = { ErrorMessage: '' } } = r.response;

                Alert.error(`${Exception.ErrorMessage}`);
              }
            })
            .catch(e => {
              Alert.error(e.message);
            });
        }
      })
      .catch(e => {
        Alert.error(
          `${e.message}: Databank-н төлбөрийн програмтай холбогдсонгүй`
        );
      });
  }

  render() {
    const { orientation } = this.props;
    const isPortrait = orientation === 'portrait';

    return (
      <>
        <TypeWrapper isPortrait={isPortrait}>
          <h2>
            <b>{__('Please follow the instructions')}</b>&nbsp;
            {__('on the card reader to make payment')}
          </h2>
          <Cards isPortrait={isPortrait}>
            <div>
              <img src="/images/payment-success.gif" alt="card-reader" />
            </div>
          </Cards>
        </TypeWrapper>
      </>
    );
  } // end render()

  componentDidMount() {
    this.setupTimer();
  }

  componentDidUpdate() {
    this.setupTimer();
  }

  componentWillUnmount() {
    clearTimeout(this.timeoutId);
  }
}
