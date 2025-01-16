import {
  AddTransactionsMutationResponse,
  EditTransactionsMutationResponse,
  TransactionDetailQueryResponse,
} from "../types";
import { Alert, Spinner } from "@erxes/ui/src";
import React, { useState } from "react";
import { gql, useMutation, useQuery } from "@apollo/client";
import { mutations, queries } from "../graphql";

import { AccountingsConfigsQueryResponse } from "../../settings/configs/types";
import TransactionForm from "../components/TransactionForm";
import { queries as configsQueries } from "../../settings/configs/graphql";
import { useNavigate } from "react-router-dom";

type Props = {
  parentId?: string;
  queryParams: any;
};

const TransactionFormContainer = (props: Props) => {
  const { parentId, queryParams } = props;
  const navigate = useNavigate();

  const [loading, setLoading] = useState<boolean>(false);

  const configsQuery = useQuery<AccountingsConfigsQueryResponse>(
    gql(configsQueries.configs)
  );

  const trDetailQuery = useQuery<TransactionDetailQueryResponse>(
    gql(queries.transactionDetail),
    {
      skip: !parentId,
      fetchPolicy: "cache-and-network",
      variables: {
        _id: parentId,
      },
    }
  );

  const [addTransactionsMutation] =
    useMutation<AddTransactionsMutationResponse>(
      gql(mutations.transactionsCreate)
    );

  const [editTransactionsMutation] =
    useMutation<EditTransactionsMutationResponse>(
      gql(mutations.transactionsUpdate),
      {
        refetchQueries: ["transactionDetail"],
      }
    );

  if (
    (trDetailQuery && trDetailQuery.loading) ||
    (configsQuery && configsQuery.loading)
  ) {
    return <Spinner objective={true} />;
  }

  let transactions = trDetailQuery?.data?.accTransactionDetail;
  const configs = configsQuery.data?.accountingsConfigs || [];
  const configsMap = {};

  for (const config of configs) {
    configsMap[config.code] = config.value;
  }

  const save = (docs) => {
    setLoading(true);

    const saveMutation = parentId
      ? editTransactionsMutation
      : addTransactionsMutation;

    const trDocs: any = [];

    for (const doc of docs) {
      const trDoc: any = {
        _id: doc._id,
        ptrId: doc.ptrId,
        parentId,
        number: doc.number ? doc.number : "auto/new",

        date: new Date(doc.date),
        description: doc.description,
        journal: doc.journal,
        followInfos: doc.followInfos,

        branchId: doc.branchId,
        departmentId: doc.departmentId,
        customerType: doc.customerType,
        customerId: doc.customerId,
        assignedUserIds: doc.assignedUserIds,

        hasVat: doc.hasVat,
        vatRowId: doc.vatRowId,
        afterVat: doc.afterVat,
        isHandleVat: doc.isHandleVat,
        vatAmount: doc.vatAmount && Number(doc.vatAmount),

        hasCtax: doc.hasCtax,
        ctaxRowId: doc.ctaxRowId,
        isHandleCtax: doc.isHandleCtax,
        ctaxAmount: doc.ctaxAmount && Number(doc.ctaxAmount),
        details: [],
      };

      for (const detail of doc.details) {
        trDoc.details.push({
          _id: detail._id,
          accountId: detail.accountId,
          transactionId: detail.transactionId,
          originId: detail.originId,
          followInfos: detail.followInfos,

          side: detail.side,
          amount: detail.amount && Number(detail.amount),
          currency: detail.currency,
          currencyAmount:
            detail.currencyAmount && Number(detail.currencyAmount),
          customRate: detail.customRate && Number(detail.customRate),
          assignedUserId: detail.assignedUserId,

          productId: detail.productId,
          count: detail.count && Number(detail.count),
          unitPrice: detail.unitPrice && Number(detail.unitPrice),
        });
      }

      trDocs.push(trDoc);
    }

    return saveMutation({
      variables: {
        parentId,
        trDocs: trDocs,
      },
    })
      .then(() => {
        if (!parentId) {
          const newParentId = (transactions || [])[0]?.parentId;
          Alert.success("You successfully created transactions");

          const pathname = newParentId
            ? `/accountings/transaction/edit/${newParentId}`
            : "/accountings/ptrs";

          {
            navigate({
              pathname,
            });
          }
        } else {
          Alert.success("You successfully updated transactions");
          trDetailQuery.refetch();
          setLoading(false);
        }
      })

      .catch((error) => {
        Alert.error(error.message);

        setLoading(false);
        return docs;
      });
  };

  const updatedProps = {
    ...props,
    configsMap,
    parentId,
    transactions,
    save,
    defaultJournal: queryParams.defaultJournal,
    loading,
  };

  return <TransactionForm {...updatedProps} />;
};

export default TransactionFormContainer;
