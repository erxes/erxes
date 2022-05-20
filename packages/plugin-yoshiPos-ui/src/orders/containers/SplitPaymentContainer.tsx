import { graphql } from 'react-apollo';
import { withRouter } from 'react-router-dom';
import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import React from 'react';

import withCurrentUser from 'modules/auth/containers/withCurrentUser';
import { IRouterProps } from '../../../types';
import { withProps, trimGraphqlError } from '../../utils';
import { Alert, __ } from 'modules/common/utils';
import { queries, mutations } from '../graphql/index';
import SplitPayment from '../components/splitPayment/SplitPayment';
import {
  IPaymentInput,
  IInvoiceParams,
  IInvoiceCheckParams,
  IPaymentParams,
  IOrder
} from '../types';

type Props = {
  order: IOrder;
  onOrdersChange: (orderProps) => void;
  onChangeProductBodyType: (type: string) => void;
  refetchOrder: () => void;
};

type FinalProps = {
  addPaymentMutation: any;
  createInvoiceMutation: any;
  checkInvoiceMutation: any;
  cancelInvoiceMutation: any;
  settlePaymentMutation: any;
} & Props &
  IRouterProps;

class SplitPaymentContainer extends React.Component<FinalProps> {
  render() {
    const {
      addPaymentMutation,
      createInvoiceMutation,
      checkInvoiceMutation,
      cancelInvoiceMutation,
      settlePaymentMutation,
      order,
      onChangeProductBodyType,
      onOrdersChange,
      refetchOrder
    } = this.props;

    const addPayment = (params: IPaymentInput, callback) => {
      addPaymentMutation({ variables: params })
        .then(() => {
          if (callback) {
            callback();
          }
        })
        .catch(e => {
          Alert.error(__(trimGraphqlError(e.message)));
        });
    };

    const createQPayInvoice = (params: IInvoiceParams) => {
      createInvoiceMutation({ variables: params })
        .then(() => {})
        .catch(e => {
          Alert.error(__(trimGraphqlError(e.message)));
        });
    };

    const checkQPayInvoice = (params: IInvoiceCheckParams) => {
      checkInvoiceMutation({ variables: params })
        .then(() => {})
        .catch(e => {
          Alert.error(__(trimGraphqlError(e.message)));
        });
    };

    const cancelInvoice = (_id: string) => {
      cancelInvoiceMutation({ variables: { _id } })
        .then(() => {
          Alert.success(__('QPay invoice has been cancelled'));
          refetchOrder();
        })
        .catch(e => {
          Alert.error(__(trimGraphqlError(e.message)));
        });
    };

    const settlePayment = (_id: string, params: IPaymentParams) => {
      settlePaymentMutation({ variables: { ...params, _id } })
        .then(({ data }) => {
          if (data.ordersSettlePayment) {
            const resp = data.ordersSettlePayment;

            if (resp.success === 'true') {
              return Alert.success(__('Payment successful'));
            }
            if (resp.message) {
              return Alert.warning(resp.message);
            }
            if (resp.lotteryWarningMsg) {
              return Alert.warning(resp.lotteryWarningMsg);
            }
            if (resp.getInformation) {
              return Alert.warning(resp.getInformation);
            }
          }
        })
        .then(() => {
          window.open(`/order-receipt/${_id}`, '_blank');
          window.location.href = '/pos';
        })
        .catch(e => {
          Alert.error(__(trimGraphqlError(e.message)));
        });
    };

    return (
      <SplitPayment
        order={order}
        onOrdersChange={onOrdersChange}
        addPayment={addPayment}
        createQPayInvoice={createQPayInvoice}
        checkQPayInvoice={checkQPayInvoice}
        cancelQPayInvoice={cancelInvoice}
        settlePayment={settlePayment}
        onChangeProductBodyType={onChangeProductBodyType}
        refetchOrder={refetchOrder}
      />
    );
  }
}

const getRefetchQueries = _id => {
  return [
    {
      query: gql(queries.orderDetail),
      variables: { _id }
    }
  ];
};

export default withProps<Props>(
  compose(
    graphql<Props>(gql(mutations.ordersAddPayment), {
      name: 'addPaymentMutation',
      options: ({ order }) => ({
        refetchQueries: getRefetchQueries(order._id)
      })
    }),
    graphql<Props>(gql(mutations.createQpaySimpleInvoice), {
      name: 'createInvoiceMutation',
      options: ({ order }) => ({
        refetchQueries: getRefetchQueries(order._id)
      })
    }),
    graphql<Props>(gql(mutations.qpayCheckPayment), {
      name: 'checkInvoiceMutation',
      options: ({ order }) => ({
        refetchQueries: getRefetchQueries(order._id)
      })
    }),
    graphql<Props>(gql(mutations.qpayCancelInvoice), {
      name: 'cancelInvoiceMutation',
      options: ({ order }) => ({
        refetchQueries: getRefetchQueries(order._id)
      })
    }),
    graphql<Props>(gql(mutations.ordersSettlePayment), {
      name: 'settlePaymentMutation',
      options: ({ order }) => ({
        refetchQueries: getRefetchQueries(order._id)
      })
    })
  )(withCurrentUser(withRouter<FinalProps>(SplitPaymentContainer)))
);
