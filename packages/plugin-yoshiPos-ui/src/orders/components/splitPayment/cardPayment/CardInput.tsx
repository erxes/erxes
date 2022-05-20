import 'abortcontroller-polyfill/dist/polyfill-patch-fetch';
import React from 'react';
import NumberFormat from 'react-number-format';

import Button from 'modules/common/components/Button';
import Icon from 'modules/common/components/Icon';
import FormGroup from 'modules/common/components/form/Group';
import ControlLabel from 'modules/common/components/form/Label';
import { __, Alert } from 'modules/common/utils';
import { CardInputColumn, Input } from 'modules/orders/styles';
import { IOrder, IPaymentInput } from 'modules/orders/types';

type Props = {
  color?: string;
  billType: string;
  addPayment: (params: IPaymentInput, callback?: () => void) => void;
  order: IOrder;
  maxAmount: number | undefined;
  cardAmount: number;
  setAmount: (amount) => void;
};

type State = {
  sentTransaction: boolean;
  checkedTransaction: boolean;
};

export default class CardInput extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      sentTransaction: false,
      checkedTransaction: false
    };
  }

  render() {
    const {
      color = '',
      addPayment,
      order,
      maxAmount = 0,
      setAmount,
      cardAmount,
      billType
    } = this.props;

    const { _id } = order;

    if (!_id) {
      return null;
    }

    const inputProps: any = {
      allowNegative: false,
      thousandSeparator: true,
      prefix: '₮',
      inputMode: 'numeric'
    };

    const handleInput = (value: number | undefined = 0) => {
      // do not accept amount greater than payable amount
      const val = Number((value > maxAmount ? maxAmount : value).toFixed(2));

      setAmount(val);
    };

    const resetInput = () => {
      setAmount(0);
    };

    const PATH = 'http://localhost:27028';

    const sendTransaction = async () => {
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
                  amount: cardAmount.toString(),
                  vatps_bill_type: billType
                }
              })
            })
              .then(res => res.json())
              .then(r => {
                if (r && r.status === true && r.response) {
                  if (r.response.response_code === '000') {
                    Alert.success(
                      __(
                        r.response.response_msg || 'Transaction was successful'
                      )
                    );

                    addPayment({ _id, cardInfo: r.response, cardAmount });
                  } else {
                    Alert.warning(r.response.response_msg);
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
    };

    return (
      <>
        <CardInputColumn style={{ alignItems: 'center' }}>
          <FormGroup>
            <ControlLabel>{__('By Card')}</ControlLabel>
            <Input color={color}>
              <NumberFormat
                name="cardAmount"
                value={cardAmount || 0}
                onValueChange={values => handleInput(values.floatValue)}
                {...inputProps}
              />
              <div onClick={resetInput}>
                <Icon icon="cancel" size={13} />
              </div>
            </Input>
          </FormGroup>
          {/** Гүйлгээ хийх доод дүн 100₮ */}
          {cardAmount >= 100 ? (
            <Button
              size="small"
              btnStyle="warning"
              onClick={sendTransaction}
              block={true}
            >
              {__('Send transaction')}
            </Button>
          ) : null}
        </CardInputColumn>
      </>
    );
  } // end render()
}
