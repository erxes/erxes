import React from 'react';
import { useQuery } from 'react-apollo';
import { mutations, queries } from '../../graphql';
import gql from 'graphql-tag';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import CommentComponent from '../../components/comment/Comment';
import { withRouter } from 'react-router-dom';
import * as compose from 'lodash.flowright';
import { graphql } from 'react-apollo';
import { Alert, confirm, withProps } from '@erxes/ui/src/utils';
import { IRouterProps } from '@erxes/ui/src/types';
import { RemoveMutationResponse } from '../../types';

type Props = {
  comment: any;
  onDeleted?: (string) => any;
  renderButton: (props: IButtonMutateProps) => JSX.Element;
} & IRouterProps &
  RemoveMutationResponse;

const Comment: React.FC<Props> = ({
  comment,
  onDeleted,
  renderButton,
  removeMutation
}: Props) => {
  const repliesQuery = useQuery(gql(queries.forumComments), {
    variables: {
      replyToId: [comment._id],
      sort: { _id: -1 }
    }
  });

  const onDelete = async (item: any) => {
    if (
      !confirm(
        `Are you sure you want to delete this comment: "${item.content}"`
      )
    ) {
      return null;
    }

    removeMutation({ variables: { _id: item._id } });
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

export default withProps<{}>(
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
  )(withRouter<Props>(Comment))
);
