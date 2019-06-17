import gql from 'graphql-tag';
import { Alert, confirm, withProps } from 'modules/common/utils';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import { List } from '../components';
import { mutations, queries } from '../graphql';
import {
  AddMutationResponse,
  EditMutationResponse,
  ITagSaveParams,
  MutationVariables,
  RemoveMutationResponse,
  TagsQueryResponse
} from '../types';

type Props = {
  type: string;
};

type FinalProps = {
  tagsQuery: TagsQueryResponse;
} & Props &
  AddMutationResponse &
  EditMutationResponse &
  RemoveMutationResponse;

const ListContainer = (props: FinalProps) => {
  const { tagsQuery, addMutation, editMutation, removeMutation, type } = props;

  const remove = tag => {
    confirm().then(() => {
      removeMutation({ variables: { ids: [tag._id] } })
        .then(() => {
          Alert.success('You successfully deleted a tag');
          tagsQuery.refetch();
        })
        .catch(e => {
          Alert.error(e.message);
        });
    });
  };

  const save = ({ tag, doc, callback }: ITagSaveParams) => {
    let mutation = addMutation;

    if (tag) {
      doc._id = tag._id;
      mutation = editMutation;
    }

    mutation({ variables: doc })
      .then(() => {
        Alert.success(`You successfully ${tag ? 'updated' : 'added'} a tag`);

        tagsQuery.refetch();

        if (callback) {
          callback();
        }
      })
      .catch(e => {
        Alert.error(e.message);
      });
  };

  const updatedProps = {
    ...props,
    tags: tagsQuery.tags || [],
    loading: tagsQuery.loading,
    type,
    remove,
    save
  };

  return <List {...updatedProps} />;
};

const options = ({ type }) => ({
  refetchQueries: [
    {
      query: gql(queries.tags),
      variables: { type }
    }
  ]
});

export default withProps<Props>(
  compose(
    graphql<Props, TagsQueryResponse, { type: string }>(gql(queries.tags), {
      name: 'tagsQuery',
      options: ({ type }) => ({
        variables: { type },
        fetchPolicy: 'network-only'
      })
    }),
    graphql<Props, AddMutationResponse, MutationVariables>(gql(mutations.add), {
      name: 'addMutation',
      options
    }),
    graphql<Props, EditMutationResponse, MutationVariables>(
      gql(mutations.edit),
      { name: 'editMutation', options }
    ),
    graphql<Props, RemoveMutationResponse, { ids: string[] }>(
      gql(mutations.remove),
      {
        name: 'removeMutation',
        options
      }
    )
  )(ListContainer)
);
