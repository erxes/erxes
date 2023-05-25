import { Config, IUser } from "../../types";
import { gql, useMutation, useQuery } from "@apollo/client";
import { mutations, queries } from "../graphql";

import Detail from "../components/Detail";
import React from "react";
import { capitalize } from "../../common/utils";
import { confirm } from "../../utils";

type Props = {
  _id?: string;
  currentUser: IUser;
  config: Config;
  type: string;
  onClose: () => void;
};

function DetailContainer({ _id, type, ...props }: Props) {
  const { data, loading: cardQueryLoading } = useQuery(
    gql(queries[`clientPortalGet${capitalize(type)}`]),
    {
      variables: { _id },
      skip: !_id,
    }
  );

  const { data: commentsQuery, loading: commentsQueryLoading } = useQuery(
    gql(queries.clientPortalComments),
    {
      variables: { typeId: _id, type },
      skip: !_id,
    }
  );

  const [createComment] = useMutation(gql(mutations.clientPortalCommentsAdd), {
    refetchQueries: [
      {
        query: gql(queries.clientPortalComments),
        variables: { typeId: _id, type },
      },
    ],
  });

  const [deleteComment] = useMutation(
    gql(mutations.clientPortalCommentsRemove),
    {
      refetchQueries: [
        {
          query: gql(queries.clientPortalComments),
          variables: { typeId: _id, type },
        },
      ],
    }
  );

  if (cardQueryLoading || commentsQueryLoading) return null;

  const item = data[`clientPortal${capitalize(type)}`];
  const comments = commentsQuery?.clientPortalComments || [];

  const handleSubmit = (values: { content: string }) => {
    createComment({
      variables: {
        ...values,
        typeId: item._id,
        type,
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
    type,
    comments,
    handleSubmit,
    handleRemoveComment,
  };

  return <Detail {...updatedProps} />;
}

export default DetailContainer;
