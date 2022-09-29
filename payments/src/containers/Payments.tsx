import { gql, useMutation, useQuery, useLazyQuery } from '@apollo/client';
import { useEffect, useState } from 'react';
import { withRouter } from 'react-router-dom';

import Payments from '../components/Payments';
import { mutations, queries } from '../graphql';
import { IPaymentParams, IRouterProps } from '../types';
import { docodeQueryParams } from '../utils';

const PaymentsContainer = (props: IRouterProps) => {
  const { history } = props;
  const { location } = history;

  const params = docodeQueryParams(location.search);

  const [paymentConfigId, setPaymentConfigId] = useState('');
  const [invoiceId, setInvoiceId] = useState('');

  const [createMutation] = useMutation(gql(mutations.createInvoice), {
    refetchQueries: [
      {
        query: gql(queries.getInvoiceQuery),
        variables: { invoiceId, paymentId: paymentConfigId },
      },
    ],
  });

  const getInvoiceQuery = useQuery(gql(queries.getInvoiceQuery), {
    variables: {
      invoiceId,
      paymentId: paymentConfigId,
    },
    skip: !paymentConfigId || !invoiceId,
  });

  const paymentsQuery = useQuery(gql(queries.paymentConfigs), {
    variables: { paymentIds: params.paymentIds },
  });

  const [checkInvoice, { called, data, loading }] = useLazyQuery(
    gql(queries.checkInvoiceQuery),
    { variables: { invoiceId, paymentId: paymentConfigId } }
  );

  let iSloading = loading || getInvoiceQuery.loading || paymentsQuery.loading;

  useEffect(() => {}, [invoiceId, paymentConfigId]);

  const onClickInvoiceCreate = (paymentId: string, params: IPaymentParams) => {
    createMutation({
      variables: {
        paymentId,
        ...params,
      },
    })
      .then(({ data }) => {
        const { createInvoice } = data;
        const { status } = createInvoice;

        if (status !== 'success') {
          return window.alert('Failed to create invoice');
        }

        setInvoiceId(createInvoice.data._id);
        setPaymentConfigId(paymentId);
      })
      .catch((error) => {
        window.alert(error.message);
      });
  };

  const onClickCheck = () => {

    checkInvoice();
  };

  if (iSloading) {
    return <>...loading</>;
  }

  const invoice = getInvoiceQuery.data && getInvoiceQuery.data.getInvoice;

  const updatedProps = {
    ...props,
    invoice,
    datas: paymentsQuery.data.paymentConfigs,
    params,
    paymentId: paymentConfigId,
    onClickInvoiceCreate,
    onClickCheck,
  };

  return <Payments {...updatedProps} />;
};

export default withRouter<IRouterProps>(PaymentsContainer);
