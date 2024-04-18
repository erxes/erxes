import { Alert, EmptyState, Spinner } from "@erxes/ui/src";
import {
  DetailQueryResponse,
  EditMutationResponse,
  IPeriodLock,
  RemoveMutationResponse,
} from "../types";
import { mutations, queries } from "../graphql";
import { useMutation, useQuery } from "@apollo/client";

import { IUser } from "@erxes/ui/src/auth/types";
import PeriodLockDetails from "../components/PeriodLockDetails";
import React from "react";
import { gql } from "@apollo/client";
import { useNavigate } from "react-router-dom";

type Props = {
  id: string;
};

type FinalProps = {
  currentUser: IUser;
} & Props;

const PeriodLockDetailsContainer = (props: FinalProps) => {
  const { currentUser, id } = props;

  const periodLockDetailQuery = useQuery<DetailQueryResponse>(
    gql(queries.periodLockDetail),
    {
      variables: {
        _id: id,
      },
      fetchPolicy: "network-only",
    }
  );

  const [periodLocksEdit] = useMutation<EditMutationResponse>(
    gql(mutations.periodLocksEdit),
    {
      refetchQueries: ["savingsPeriodLockDetail"],
    }
  );

  const [periodLocksRemove] = useMutation<RemoveMutationResponse>(
    gql(mutations.periodLocksRemove),
    {
      refetchQueries: ["savingsPeriodLocksMain"],
    }
  );

  const saveItem = (doc: IPeriodLock, callback: (item) => void) => {
    periodLocksEdit({ variables: { ...doc } })
      .then(({ data }) => {
        if (callback) {
          callback((data || {}).periodLocksEdit);
        }
        Alert.success("You successfully updated contract type");
      })
      .catch((error) => {
        Alert.error(error.message);
      });
  };

  const remove = () => {
    const { id } = props;
    const navigate = useNavigate();

    periodLocksRemove({ variables: { periodLockIds: [id] } })
      .then(() => {
        Alert.success("You successfully deleted a contract");
        navigate("/erxes-plugin-saving/contract-types");
      })
      .catch((e) => {
        Alert.error(e.message);
      });
  };

  if (periodLockDetailQuery.loading) {
    return <Spinner objective={true} />;
  }

  if (!periodLockDetailQuery?.data?.periodLockDetail) {
    return (
      <EmptyState text="Period Lock not found" image="/images/actions/24.svg" />
    );
  }

  const periodLockDetail = periodLockDetailQuery?.data?.periodLockDetail;

  const updatedProps = {
    ...props,
    loading: periodLockDetailQuery.loading,
    periodLock: periodLockDetail,
    currentUser,
    saveItem,
    remove,
  };

  return <PeriodLockDetails {...(updatedProps as any)} />;
};

export default PeriodLockDetailsContainer;
