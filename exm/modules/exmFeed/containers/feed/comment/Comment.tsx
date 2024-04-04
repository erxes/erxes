import * as compose from 'lodash.flowright';

import { Alert, confirm, withProps } from '../../../../utils';
import { IComment, RemoveMutationResponse } from '../../../../types';
import { mutations, queries } from '../../../graphql';

import CommentComponent from '../../../components/feed/comment/Comment';
import { IButtonMutateProps } from '../../../../common/types';
import React from 'react';
import { gql, useQuery } from '@apollo/client';
import { graphql } from '@apollo/client/react/hoc';

type Props = {
  comment: IComment;
  onDeleted?: (string) => void;
  renderButton: (props: IButtonMutateProps) => JSX.Element;
};

type FinalProps = Props & RemoveMutationResponse;

const Comment: React.FC<FinalProps> = ({
  comment,
  onDeleted,
  renderButton,
  removeMutation
}: FinalProps) => {
  const repliesQuery = useQuery(gql(queries.comments), {
    variables: {
      parentId: comment._id,
      sort: { _id: -1 },
      contentType: 'exmFeed',
      contentId: comment.contentId
    }
  });

  const onDelete = async (item: any) => {
    confirm(`Are you sure you want to delete this comment?`)
      .then(() => {
        removeMutation({
          variables: { _id: item._id },
          refetchQueries: ['comments']
        })
          .then(() => {
            Alert.success('You successfully deleted a comment');
          })
          .catch(e => {
            Alert.error(e.message);
          });
      })
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
      replies={repliesQuery.data?.comments.list}
    />
  );
};

export default withProps<Props>(
  compose(
    graphql<RemoveMutationResponse, { _id: string }>(
      gql(mutations.commentRemove),
      {
        name: 'removeMutation',
        options: () => ({
          refetchQueries: ['exmFeed']
        })
      }
    )
  )(Comment)
);
