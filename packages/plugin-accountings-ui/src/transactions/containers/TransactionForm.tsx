import { gql, useMutation, useQuery } from "@apollo/client";
import { Alert, Spinner } from "@erxes/ui/src";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AddTransactionsMutationResponse,
  EditTransactionsMutationResponse,
  TransactionDetailQueryResponse,
} from "../types";
import TransactionForm from "../components/TransactionForm";
import { mutations, queries } from "../graphql";

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

  const [addTransactionsMutation] = useMutation<AddTransactionsMutationResponse>(
    gql(mutations.transactionsCreate)
  );
  const [editTransactionsMutation] = useMutation<EditTransactionsMutationResponse>(
    gql(mutations.transactionsUpdate)
  );

  if (trDetailQuery && trDetailQuery.loading) {
    return <Spinner objective={true} />;
  }

  const save = (docs) => {
    setLoading(true);

    const saveMutation = parentId ? editTransactionsMutation : addTransactionsMutation;

    const trDocs: any = [];

    for (const doc of docs) {
      const trDoc: any = {
        ptrId: doc.ptrId,
        parentId,
        number: doc.number,

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
        afterVatAccountId: doc.afterVatAccountId,
        isHandleVat: doc.isHandleVat,
        vatAmount: doc.vatAmount && Number(doc.vatAmount),

        hasCtax: doc.hasCtax,
        ctaxRowId: doc.ctaxRowId,
        isHandleCtax: doc.isHandleCtax,
        ctaxAmount: doc.ctaxAmount && Number(doc.ctaxAmount),
        details: [],
      }

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
          currencyAmount: detail.currencyAmount && Number(detail.currencyAmount),
          customRate: detail.customRate && Number(detail.customRate),
          assignedUserId: detail.assignedUserId,

          productId: detail.productId,
          count: detail.count && Number(detail.count),
          unitPrice: detail.unitPrice && Number(detail.unitPrice),
        })
      }

      trDocs.push(trDoc);
    }

    saveMutation({
      variables: {
        parentId,
        trDocs: trDocs,
      },
    })
      .then((data) => {
        if (!parentId) {
          const newParentId = data.data.transactionsCreate[0]?.parentId
          Alert.success("You successfully created transactions");
  
          navigate({
            pathname: `/accountings/transaction/edit/${newParentId}`,
          });
        } else {
          Alert.success("You successfully updated transactions");
        }
      })

      .catch((error) => {
        Alert.error(error.message);

        setLoading(false);
      });
  };

  const transactions = trDetailQuery?.data?.transactionDetail;

  const updatedProps = {
    ...props,
    parentId,
    transactions,
    save,
    defaultJournal: queryParams.defaultJournal,
    isActionLoading: loading,
  };

  return <TransactionForm {...updatedProps} />;
};

export default PosContainer;
