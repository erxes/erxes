import { Config, IUser } from "../../types";
import { gql, useMutation, useQuery } from "@apollo/client";
import { mutations, queries } from "../graphql";

import Detail from "../components/Detail";
import React from "react";
import { confirm } from "../../utils";

type Props = {
  _id?: string;
  currentUser: IUser;
  config: Config;
  onClose: () => void;
};

function DetailContainer({ _id, ...props }: Props) {
  const { data, loading: purchaseQueryLoading } = useQuery(
    gql(queries.clientPortalGetPurchase),
    {
      variables: { _id },
      skip: !_id,
      context: {
        headers: {
          "erxes-app-token": props.config?.erxesAppToken,
        },
      },
    }
  );

  const { data: commentsQuery, loading: commentsQueryLoading } = useQuery(
    gql(queries.clientPortalComments),
    {
      variables: { typeId: _id, type: "purchase" },
      skip: !_id,
    }
  );

  const [createComment] = useMutation(gql(mutations.clientPortalCommentsAdd), {
    refetchQueries: [
      {
        query: gql(queries.clientPortalComments),
        variables: { typeId: _id, type: "purchase" },
      },
    ],
  });

  const [deleteComment] = useMutation(
    gql(mutations.clientPortalCommentsRemove),
    {
      refetchQueries: [
        {
          query: gql(queries.clientPortalComments),
          variables: { typeId: _id, type: "purchase" },
        },
      ],
    }
  );

  if (purchaseQueryLoading || commentsQueryLoading) return null;

  const item = data?.purchaseDetail;
  const comments = commentsQuery?.clientPortalComments || [];

  const handleSubmit = (values: { content: string }) => {
    createComment({
      variables: {
        ...values,
        typeId: item._id,
        type: "purchase",
        userType: "client",
      },
    });
  };

  const handleRemoveComment = (commentId: string) => {
    confirm().then(() =>
      deleteComment({
        variables: {
          _id: commentId,
        },
      })
    );
  };

  const updatedProps = {
    ...props,
    item,
    comments,
    handleSubmit,
    handleRemoveComment,
  };

  return <Detail {...updatedProps} />;
}

export default DetailContainer;
