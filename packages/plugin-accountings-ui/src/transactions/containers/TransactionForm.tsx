import { gql, useMutation, useQuery } from "@apollo/client";
import { Alert, Spinner } from "@erxes/ui/src";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  TransactionDetailQueryResponse,
} from "../types";
import TransactionForm from "../components/TransactionForm";
import { mutations, queries } from "../graphql";
import { ITransaction } from "../types";

type Props = {
  parentId?: string;
  queryParams: any;
};

const PosContainer = (props: Props) => {
  const { parentId, queryParams } = props;
  const navigate = useNavigate();

  const [loading, setLoading] = useState<boolean>(false);

  const trDetailQuery = useQuery<TransactionDetailQueryResponse>(
    gql(queries.transactionDetail),
    {
      skip: !parentId,
      fetchPolicy: "network-only",
      variables: {
        _id: parentId || ""
      },
    }
  );


  // const [addPosMutation] = useMutation<AddPosMutationResponse>(
  //   gql(mutations.posAdd)
  // );
  // const [editPosMutation] = useMutation<EditPosMutationResponse>(
  //   gql(mutations.posEdit)
  // );

  if (trDetailQuery && trDetailQuery.loading) {
    return <Spinner objective={true} />;
  }

  const save = (doc) => {
    setLoading(true);

    // const saveMutation = posId ? editPosMutation : addPosMutation;

    // saveMutation({
    //   variables: {
    //     _id: posId,
    //     ...doc,
    //   },
    // })
    //   .then(() => {
    //     Alert.success("You successfully updated a pos");

    //     navigate({
    //       pathname: `/pos`,
    //       search: "?refetchList=true",
    //     });
    //   })

    //   .catch((error) => {
    //     Alert.error(error.message);

    //     setLoading(false);
    //   });
  };

  const transactions = trDetailQuery?.data?.transactionDetail;

  const updatedProps = {
    ...props,
    transactions,
    save,
    defaultJournal: queryParams.defaultJournal,
    isActionLoading: loading,
  };

  return <TransactionForm {...updatedProps} />;
};

export default PosContainer;
