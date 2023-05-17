import { gql, useMutation, useQuery } from "@apollo/client";
import { mutations, queries } from "../graphql";

import Detail from "../components/Detail";
import { IUser } from "../../types";
import React from "react";
import { confirm } from "../../utils";

type Props = {
  _id?: string;
  currentUser: IUser;
  onClose: () => void;
};

function DetailContainer({ _id, ...props }: Props) {
  const { data, loading: taskQueryLoading } = useQuery(
    gql(queries.clientPortalGetTask),
    {
      variables: { _id },
      skip: !_id,
    }
  );

  const { data: commentsQuery, loading: commentsQueryLoading } = useQuery(
    gql(queries.clientPortalComments),
    {
      variables: { typeId: _id, type: "task" },
      skip: !_id,
    }
  );

  const [createComment] = useMutation(gql(mutations.clientPortalCommentsAdd), {
    refetchQueries: [
      {
        query: gql(queries.clientPortalComments),
        variables: { typeId: _id, type: "task" },
      },
    ],
  });

  const [deleteComment] = useMutation(
    gql(mutations.clientPortalCommentsRemove),
    {
      refetchQueries: [
        {
          query: gql(queries.clientPortalComments),
          variables: { typeId: _id, type: "task" },
        },
      ],
    }
  );

  if (taskQueryLoading || commentsQueryLoading) return null;

  const item = data?.taskDetail;
  const comments = commentsQuery?.clientPortalComments || [];

  const handleSubmit = (values: { content: string }) => {
    createComment({
      variables: {
        ...values,
        typeId: item._id,
        type: "task",
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
