import { useMutation } from "@apollo/client";
import gql from "graphql-tag";
import React from "react";
import Qpay from "../components/Qpay";
import { mutations, queries } from "../graphql";
import { IPaymentParams } from "../types";

type Props = {
  paymentConfigId: string;
  params: IPaymentParams;
};

const QpayFormContainer = (props: Props) => {
  const { params } = props;
  

  const [createMutation, { loading, error }] = useMutation(
    gql(mutations.createInvoice)
  );

  const onCreateInvoice = () => {
    createMutation({
      variables: {
        paymentId: props.paymentConfigId,
        ...params
      }
    })
      .then(({ data }) => {})
      .catch(error => {
        console.error(error);
      });
  };

  if (loading) {
    return <div>...loading</div>;
  }

  if (error) {
    window.alert(error.message);
  }

  const updatedProps = {
    ...props,
    onCreateInvoice
  };

  return <Qpay {...updatedProps} />;
};

// const getRefetchQueries = () => {
//   return [
//     {
//       query: gql(queries.placesQuery)
//     }
//   ];
// };

export default QpayFormContainer;
