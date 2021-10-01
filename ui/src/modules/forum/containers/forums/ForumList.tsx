import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import { graphql } from 'react-apollo';
import React from 'react';
import { ForumList } from '../../components/forums';
import { mutations, queries } from '../../graphql';
import ButtonMutate from 'modules/common/components/ButtonMutate';
import { IButtonMutateProps } from 'modules/common/types';
import { Alert, confirm } from 'modules/common/utils';

import {
  RemoveForumsMutationResponse,
  ForumsQueryResponse,
  ForumsTotalCountQueryResponse
} from '../../types';

type Props = {
  queryParams: any;
  currentTopicId: string;
};

type FinalProps = {
  forumsQuery: ForumsQueryResponse;
  forumsCountQuery: ForumsTotalCountQueryResponse;
} & Props &
  RemoveForumsMutationResponse;

const ForumListContainer = (props: FinalProps) => {
  const { forumsQuery, removeForumsMutation, forumsCountQuery } = props;

  const remove = (forumId: string, callback?: () => void) => {
    confirm().then(() => {
      removeForumsMutation({
        variables: {
          _id: forumId
        }
      })
        .then(() => {
          forumsQuery.refetch();
          forumsCountQuery.refetch();

          if (callback) {
            callback();
          }

          Alert.success('You successfully deleted a forum');
        })
        .catch(error => {
          Alert.error(error.message);
        });
    });
  };

  const renderButton = ({
    name,
    values,
    isSubmitted,
    callback,
    object
  }: IButtonMutateProps) => {
    const callBackResponse = () => {
      forumsQuery.refetch();
      forumsCountQuery.refetch();

      if (callback) {
        callback();
      }
    };

    return (
      <ButtonMutate
        mutation={object ? mutations.forumsEdit : mutations.forumsAdd}
        variables={values}
        callback={callBackResponse}
        isSubmitted={isSubmitted}
        type="submit"
        successMessage={`You successfully ${
          object ? 'updated' : 'added'
        } a ${name}`}
      />
    );
  };

  const updatedProps = {
    ...props,
    forums: forumsQuery.forums || [],
    loading: forumsQuery.loading,
    renderButton,
    remove,
    forumsCount: forumsCountQuery.forumsTotalCount || 0
  };

  return <ForumList {...updatedProps} />;
};

export default compose(
  graphql<Props, RemoveForumsMutationResponse, { _id: string }>(
    gql(mutations.forumsRemove),
    {
      name: 'removeForumsMutation',
      options: ({ currentTopicId }) => {
        return {
          refetchQueries: !currentTopicId
            ? []
            : [
                {
                  query: gql(queries.forumTopicDetail),
                  variables: { _id: currentTopicId }
                },
                {
                  query: gql(queries.forumDiscussionsTotalCount),
                  variables: { topicId: currentTopicId }
                }
              ]
        };
      }
    }
  ),
  graphql<Props, ForumsQueryResponse>(gql(queries.forums), {
    name: 'forumsQuery'
  }),
  graphql<Props, ForumsTotalCountQueryResponse>(gql(queries.forumsTotalCount), {
    name: 'forumsCountQuery'
  })
)(ForumListContainer);
