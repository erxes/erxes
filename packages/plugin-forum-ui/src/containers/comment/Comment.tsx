import React from 'react';
import { useQuery } from 'react-apollo';
import { mutations, queries } from '../../graphql';
import gql from 'graphql-tag';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import CommentComponent from '../../components/comment/Comment';
import * as compose from 'lodash.flowright';
import { graphql } from 'react-apollo';
import { Alert, confirm, withProps } from '@erxes/ui/src/utils';
import { IComment, RemoveMutationResponse } from '../../types';

type Props = {
  comment: IComment;
  onDeleted?: (string) => any;
  renderButton: (props: IButtonMutateProps) => JSX.Element;
};

type FinalProps = Props & RemoveMutationResponse;

const Comment: React.FC<FinalProps> = ({
  comment,
  onDeleted,
  renderButton,
  removeMutation
}: FinalProps) => {
  const repliesQuery = useQuery(gql(queries.forumComments), {
    variables: {
      replyToId: [comment._id],
      sort: { _id: -1 }
    }
  });

  const onDelete = async (item: any) => {
    confirm(`Are you sure you want to delete this comment "${item.content}"`)
      .then(() => removeMutation({ variables: { _id: item._id } }))
      .catch(e => Alert.error(e.message));

    if (onDeleted) {
      onDeleted(item._id);
    }
  };

  return (
    <CommentComponent
      onDelete={onDelete}
      comment={comment}
      renderButton={renderButton}
      replies={repliesQuery.data?.forumComments}
    />
  );
};

export default withProps<Props>(
  compose(
    graphql<RemoveMutationResponse, { _id: string }>(
      gql(mutations.deleteComment),
      {
        name: 'removeMutation',
        options: () => ({
          refetchQueries: ['ForumPostDetail']
        })
      }
    )
  )(Comment)
);
