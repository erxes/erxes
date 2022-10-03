import { useLazyQuery, useMutation, useQuery } from "@apollo/client";
import { useEffect, useState } from "react";
import { withRouter } from "react-router-dom";
import client from "../apolloClient";

import Payments from "../components/Payments";
import { mutations, queries } from "../graphql";
import subscriptions from "../graphql/subscriptions";
import { IInvoice, IPaymentParams, IRouterProps } from "../types";
import { docodeQueryParams } from "../utils";

const PaymentsContainer = (props: IRouterProps) => {
  const { history } = props;
  const { location } = history;

  const params = docodeQueryParams(location.search);

  const [paymentConfigId, setPaymentConfigId] = useState("");
  const [invoiceId, setInvoiceId] = useState("");
  const [invoice, setInvoice] = useState<IInvoice | undefined>(undefined);

  const [createMutation, createMutationResponse] = useMutation(
    mutations.createInvoice
  );

  const [cancelMutation, cancelMutationResponse] = useMutation(
    mutations.cancelInvoice
  );

  const paymentsQuery = useQuery(queries.paymentConfigsQuery, {
    variables: { paymentConfigIds: params.paymentConfigIds }
  });

  const [checkInvoice, { data, loading }] = useLazyQuery(
    queries.checkInvoiceQuery,
    {
      variables: { invoiceId, paymentConfigId: paymentConfigId }
    }
  );

  let isLoading =
    loading || paymentsQuery.loading || createMutationResponse.loading;

  useEffect(() => {
    if (invoiceId) {
      client
        .subscribe({
          query: subscriptions.invoiceSubscription,
          variables: { _id: invoiceId }
        })
        .subscribe({
          next({ data }) {
            // if (data.invoiceUpdated && data.invoiceUpdated.status === "paid") {
            //   invoice.status = "paid";
            // }
          },
          error(_err: any) {
            // invoice.status = "error";
          }
        });
    }
  }, [invoiceId, paymentConfigId]);

  const onClickInvoiceCreate = (paymentId: string, params: IPaymentParams) => {
    if (paymentConfigId && invoiceId && paymentId !== paymentConfigId) {
      cancelMutation({
        variables: { _id: invoiceId }
      });

      setInvoiceId("");
      setInvoice(undefined);
    }

    setPaymentConfigId(paymentId);

    createMutation({
      variables: {
        paymentConfigId: paymentId,
        ...params
      }
    })
      .then(({ data }) => {
        const { invoiceCreate } = data;

        setInvoice(invoiceCreate);
        setInvoiceId(invoiceCreate._id);
      })
      .catch(error => {
        window.alert(error.message);
      });
  };

  const onClickCheck = () => {
    checkInvoice();
  };

  const updatedProps = {
    ...props,
    invoice,
    datas: (paymentsQuery.data && paymentsQuery.data.paymentConfigs) || [],
    params,
    paymentConfigId: paymentConfigId,
    isLoading,
    onClickInvoiceCreate,
    onClickCheck
  };

  return <Payments {...updatedProps} />;
};

export default withRouter<IRouterProps>(PaymentsContainer);
