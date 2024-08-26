import { gql, useQuery, useMutation } from "@apollo/client";
import React, { useState } from "react";
import { Alert, Spinner } from "@erxes/ui/src";
import Pos from "../components/Pos";
import {
  AddPosMutationResponse,
  EditPosMutationResponse,
  GroupsBulkInsertMutationResponse,
  GroupsQueryResponse,
  PosDetailQueryResponse,
  PosEnvQueryResponse,
  SlotsBulkUpdateMutationResponse,
  SlotsQueryResponse,
} from "../../types";
import { IPos } from "../../types";
import { mutations, queries } from "../graphql";
import { useNavigate } from "react-router-dom";

type Props = {
  posId?: string;
  queryParams: any;
};

const PosContainer = (props: Props) => {
  const { posId } = props;
  const navigate = useNavigate();

  const [loading, setLoading] = useState<boolean>(false);

  const posDetailQuery = useQuery<PosDetailQueryResponse>(
    gql(queries.posDetail),
    {
      skip: !posId,
      fetchPolicy: "cache-and-network",
      variables: {
        _id: posId || "",
        posId: posId || "",
      },
    }
  );

  const posEnvQuery = useQuery<PosEnvQueryResponse>(gql(queries.posEnv), {
    fetchPolicy: "cache-and-network",
  });

  const groupsQuery = useQuery<GroupsQueryResponse>(
    gql(queries.productGroups),
    {
      skip: !posId,
      fetchPolicy: "cache-and-network",
      variables: {
        posId: posId || "",
      },
    }
  );

  const slotsQuery = useQuery<SlotsQueryResponse>(gql(queries.posSlots), {
    skip: !posId,
    fetchPolicy: "network-only",
    variables: {
      posId: posId || "",
    },
  });

  const [addPosMutation] = useMutation<AddPosMutationResponse>(
    gql(mutations.posAdd)
  );
  const [editPosMutation] = useMutation<EditPosMutationResponse>(
    gql(mutations.posEdit)
  );
  const [productGroupsBulkInsertMutation] =
    useMutation<GroupsBulkInsertMutationResponse>(
      gql(mutations.saveProductGroups)
    );
  const [slotsBulkUpdateMutation] =
    useMutation<SlotsBulkUpdateMutationResponse>(gql(mutations.saveSlots));

  if (
    (posDetailQuery && posDetailQuery.loading) ||
    (groupsQuery && groupsQuery.loading) ||
    (slotsQuery && slotsQuery.loading)
  ) {
    return <Spinner objective={true} />;
  }

  const save = (doc) => {
    setLoading(true);

    const saveMutation = posId ? editPosMutation : addPosMutation;

    saveMutation({
      variables: {
        _id: posId,
        ...doc,
      },
    })
      .then((data) => {
        productGroupsBulkInsertMutation({
          variables: {
            posId: posId || data.data.posAdd._id,
            groups: doc.groups.map((e) => ({
              _id: e._id,
              name: e.name,
              description: e.description,
              categoryIds: e.categoryIds || [],
              excludedCategoryIds: e.excludedCategoryIds || [],
              excludedProductIds: e.excludedProductIds || [],
            })),
          },
        });
        slotsBulkUpdateMutation({
          variables: {
            posId: posId || data.data.posAdd._id,
            slots: doc.posSlots.map((slot) => ({
              ...slot,
              posId: slot.posId || posId || data.data.posAdd._id,
            })),
          },
        });
      })
      .then(() => {
        Alert.success("You successfully updated a pos");

        navigate({
          pathname: `/pos`,
          search: "?refetchList=true",
        });
      })

      .catch((error) => {
        Alert.error(error.message);

        setLoading(false);
      });
  };

  const pos =
    (posDetailQuery && posDetailQuery?.data?.posDetail) || ({} as IPos);
  const groups = (groupsQuery && groupsQuery?.data?.productGroups) || [];
  const slots = (slotsQuery && slotsQuery?.data?.posSlots) || [];
  const envs = posEnvQuery?.data?.posEnv || {};

  const updatedProps = {
    ...props,
    groups,
    pos,
    save,
    isActionLoading: loading,
    slots,
    envs,
  };

  return <Pos {...updatedProps} />;
};

export default PosContainer;
