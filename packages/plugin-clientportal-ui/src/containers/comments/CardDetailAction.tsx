import { useQuery, useMutation } from '@apollo/client';
import { gql } from '@apollo/client';
import { confirm } from '@erxes/ui/src/utils';
import React from 'react';
import Detail from '../../components/comments/CardDetailAction';
import { mutations, queries } from '../../graphql';

type Props = {
  item: any;
};

function DetailContainer({ item }: Props) {
  const {
    stage: { type = '' }
  } = item;

  const { data } = useQuery(gql(queries.clientPortalComments), {
    variables: { typeId: item._id, type },
    skip: !type
  });

  const comments = data?.clientPortalComments || [];

  const [createComment] = useMutation(gql(mutations.clientPortalCommentsAdd), {
    refetchQueries: [
      {
        query: gql(queries.clientPortalComments),
        variables: { typeId: item._id, type }
      }
    ]
  });

  const [deleteComment] = useMutation(
    gql(mutations.clientPortalCommentsRemove),
    {
      refetchQueries: [
        {
          query: gql(queries.clientPortalComments),
          variables: { typeId: item._id, type }
        }
      ]
    }
  );

  const handleSubmit = (values: { content: string }) => {
    createComment({
      variables: {
        ...values,
        typeId: item._id,
        type: 'ticket',
        userType: 'team'
      }
    });
  };

  const handleRemoveComment = (commentId: string) => {
    confirm().then(() =>
      deleteComment({
        variables: {
          _id: commentId
        }
      })
    );
  };

  if (type !== 'ticket') {
    return null;
  }

  const updatedProps = {
    comments,
    handleSubmit,
    handleRemoveComment
  };

  return <Detail {...updatedProps} />;
}

export default DetailContainer;
