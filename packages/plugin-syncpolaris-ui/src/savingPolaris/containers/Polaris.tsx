import React from "react";
import Polaris from "../components/index";
import { IContractDoc, savingHistoryQueryResponse } from "../types";
import { mutations, queries } from "../graphql";

import { gql } from "@apollo/client";
import { Alert, Spinner } from "@erxes/ui/src";
import {
  DepositActiveMutationResponse,
  SavingsActiveMutationResponse,
  SavingsMutationResponse,
  SendDepositMutationResponse,
} from "../types";
import { useQuery, useMutation } from "@apollo/client";

type Props = {
  contract: IContractDoc;
};

const PolarisListContainer = (props: Props) => {
  const { contract } = props;

  const savingHistoryQuery = useQuery<savingHistoryQueryResponse>(
    gql(queries.SyncSavingsData),
    {
      variables: {
        contentType: "savings:contract",
        contentId: contract._id,
      },
    }
  );

  const [sendSavings] = useMutation<SavingsMutationResponse>(
    gql(mutations.sendSaving),
    {
      refetchQueries: ["savingsContractDetail", "syncSavingsData"],
    }
  );

  const [savingActive] = useMutation<SavingsActiveMutationResponse>(
    gql(mutations.savingActive),
    {
      refetchQueries: ["savingsContractDetail", "syncSavingsData"],
    }
  );

  const [sendDeposit] = useMutation<SendDepositMutationResponse>(
    gql(mutations.sendDeposit),
    {
      refetchQueries: ["savingsContractDetail", "syncSavingsData"],
    }
  );

  const [depositActive] = useMutation<DepositActiveMutationResponse>(
    gql(mutations.depositActive),
    {
      refetchQueries: ["savingsContractDetail", "syncSavingsData"],
    }
  );

  const regenPolarisHandler = (data: any) => {
    sendSavings({ variables: { data } })
      .then(() => {
        Alert.success("Successfully synced");
      })
      .catch((error) => {
        Alert.error(error.message);
      });
  };

  const savingActiveHandler = (contractNumber: string) => {
    savingActive({ variables: { contractNumber } })
      .then(() => {
        Alert.success("Successfully activated");
      })
      .catch((error) => {
        Alert.error(error.message);
      });
  };

  const sendDepositHandler = (data: any) => {
    sendDeposit({ variables: { data } })
      .then(() => {
        Alert.success("Successfully synced");
      })
      .catch((error) => {
        Alert.error(error.message);
      });
  };

  const depositActiveHandler = (contractNumber: string) => {
    depositActive({ variables: { contractNumber } })
      .then(() => {
        Alert.success("Successfully activated");
      })
      .catch((error) => {
        Alert.error(error.message);
      });
  };

  if (savingHistoryQuery.loading) {
    return <Spinner objective={true} />;
  }

  const savingHistories =
    savingHistoryQuery?.data?.syncSavingsData || ([] as any);

  const updatedProps = {
    ...props,
    savingHistories,
    reSendContract: regenPolarisHandler,
    savingActive: savingActiveHandler,
    sendDeposit: sendDepositHandler,
    depositActive: depositActiveHandler,
  };

  return <Polaris {...updatedProps} />;
};

export default PolarisListContainer;
