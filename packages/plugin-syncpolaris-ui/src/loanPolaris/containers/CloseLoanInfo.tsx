import React from "react";
import { gql, useQuery, useMutation } from "@apollo/client";
import query from "../graphql/queries";
import { IContract, LoanCloseMutationResponse } from "../types";
import { mutations } from "../graphql";
import CloseLoan from "../components/Transaction/CloseLoan";
import { Alert } from "@erxes/ui/src";

interface IProps {
  contract: IContract;
}

function LoanInfo(props: IProps) {
  const { data: closeInfo } = useQuery<any>(gql(query.getPolarisData), {
    variables: {
      method: "getCloseLoanDetail",
      data: { number: props.contract.number }
    }
  });

  const [loanClose] = useMutation<LoanCloseMutationResponse>(
    gql(mutations.closeLoanRepayment),
    {
      refetchQueries: ["contractDetail", "syncSavingsData"]
    }
  );

  const sentTransactionHandler = (data: any) => {
    loanClose({ variables: { data } })
      .then(() => {
        Alert.success("Successfully synced");
      })
      .catch((error) => {
        Alert.error(error.message);
      });
  };

  const updatedProps = {
    ...props,
    sentTransaction: sentTransactionHandler,
    closeData: closeInfo
  };

  return <CloseLoan {...updatedProps} />;
}

export default LoanInfo;
