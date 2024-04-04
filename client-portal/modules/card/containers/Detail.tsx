import { Config, IUser } from '../../types';
import { gql, useMutation, useQuery } from '@apollo/client';
import { mutations, queries } from '../graphql';

import Detail from '../components/Detail';
import React from 'react';
import Spinner from '../../common/Spinner';
import { capitalize } from '../../common/utils';
import { confirm } from '../../utils';

type Props = {
  _id?: string;
  currentUser: IUser;
  config: Config;
  type: string;
  onClose: () => void;
  publicTask?: boolean;
};

function DetailContainer({ _id, type, publicTask, ...props }: Props) {
  const { data, loading: cardQueryLoading } = useQuery(
    gql(queries[`clientPortalGet${capitalize(type)}`]),
    {
      variables: { _id, clientPortalCard: true },
      skip: !_id,
      context: {
        headers: {
          'erxes-app-token': props.config?.erxesAppToken
        }
      }
    }
  );

  const { data: checklistsQuery, loading: checklistsQueryLoading } = useQuery(
    gql(queries.checklists),
    {
      variables: { contentType: type, contentTypeId: _id },
      skip: !_id,
      context: {
        headers: {
          'erxes-app-token': props.config?.erxesAppToken
        }
      }
    }
  );

  const { data: commentsQuery, loading: commentsQueryLoading } = useQuery(
    gql(queries.clientPortalComments),
    {
      variables: { typeId: _id, type },
      skip: !_id,
      context: {
        headers: {
          'erxes-app-token': props.config?.erxesAppToken
        }
      }
    }
  );

  const [createComment] = useMutation(gql(mutations.clientPortalCommentsAdd), {
    refetchQueries: [
      {
        query: gql(queries.clientPortalComments),
        variables: { typeId: _id, type },
        context: {
          headers: {
            'erxes-app-token': props.config?.erxesAppToken
          }
        }
      }
    ]
  });

  const [deleteComment] = useMutation(
    gql(mutations.clientPortalCommentsRemove),
    {
      refetchQueries: [
        {
          query: gql(queries.clientPortalComments),
          variables: { typeId: _id, type },
          context: {
            headers: {
              'erxes-app-token': props.config?.erxesAppToken
            }
          }
        }
      ]
    }
  );

  if (cardQueryLoading || commentsQueryLoading) {
    return <Spinner objective={true} />;
  }

  const item =
    type === 'ticket'
      ? data[`clientPortal${capitalize(type)}`]
      : data[`${type}Detail`];

  const comments = commentsQuery?.clientPortalComments || [];

  const handleSubmit = (values: { content: string }) => {
    createComment({
      variables: {
        ...values,
        typeId: item._id,
        type,
        userType: 'client'
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

  const updatedProps = {
    ...props,
    item,
    type,
    checklists: checklistsQuery?.checklists,
    comments,
    handleSubmit,
    handleRemoveComment
  };

  return <Detail {...updatedProps} />;
}

export default DetailContainer;
