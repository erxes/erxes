import { gql, useMutation, useQuery } from "@apollo/client";
import { Buffer } from "buffer";
import queryString from "query-string";
import { useEffect, useState } from "react";
import { withRouter } from "react-router-dom";

import Payments from "../components/Payments";
import { mutations, queries } from "../graphql";
import { IPaymentParams, IRouterProps } from "../types";

const PaymentsContainer = (props: IRouterProps) => {
  const { history } = props;
  const { location } = history;

  const queryParams = queryString.parse(location.search);

  const base64str = queryParams.q;
  const parsedData: string = Buffer.from(
    base64str as string,
    "base64"
  ).toString("ascii");
  const params: IPaymentParams = JSON.parse(parsedData);

  const [paymentConfigId, setPaymentConfigId] = useState("");
  const [invoiceId, setInvoiceId] = useState("");
  
  const [createMutation] = useMutation(gql(mutations.createInvoice), {
    refetchQueries: [{ query: gql(queries.getInvoiceQuery), variables: {invoiceId, paymentId: paymentConfigId}, }],
  });

  const getInvoiceQuery = useQuery(gql(queries.getInvoiceQuery), {
    variables: {
      invoiceId,
      paymentId: paymentConfigId
    },
    skip: !paymentConfigId || !invoiceId
  });

  const { data = {} as any, loading } = useQuery(gql(queries.paymentConfigs), {
    variables: { paymentIds: params.paymentIds }
  });

  let iSloading = loading || getInvoiceQuery.loading;

  useEffect(() => {}, [invoiceId, paymentConfigId]);

  const onClickInvoiceCreate = (paymentId: string, params: IPaymentParams) => {
    createMutation({
      variables: {
        paymentId,
        ...params
      }
    })
      .then(({ data }) => {
        const { createInvoice } = data;
        const { status } = createInvoice;

        if (status !== "success") {
          return window.alert("Failed to create invoice");
        }
        
        setInvoiceId(createInvoice.data._id);
        setPaymentConfigId(paymentId);
      })
      .catch(error => {
        window.alert(error.message);
      });
  };

  if (iSloading) {
    return (<>...loading</>);
  }

  const invoice = getInvoiceQuery.data && getInvoiceQuery.data.getInvoice;

  const updatedProps = {
    ...props,
    invoice,
    datas: data.paymentConfigs,
    params,
    paymentId: paymentConfigId,
    onClickInvoiceCreate
  };

  return <Payments {...updatedProps} />;
};

export default withRouter<IRouterProps>(PaymentsContainer);
