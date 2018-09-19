import gql from 'graphql-tag';
import { Alert, confirm } from 'modules/common/utils';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import { List } from '../components';
import { mutations, queries } from '../graphql';
import { ITagSaveParams } from '../types';

type Props = {
  type: string,
  tagsQuery: any,
  addMutation: (varaibles: any) => any,
  editMutation: (varaibles: any) => any,
  removeMutation: (params: { variables: { ids: string[] } }) => any,
};

const ListContainer = (props: Props) => {
  const { tagsQuery, addMutation, editMutation, removeMutation, type } = props;

  const remove = tag => {
    confirm().then(() => {
      removeMutation({ variables: { ids: [tag._id] } })
        .then(() => {
          Alert.success('success');
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
        Alert.success('Successfully saved');
        tagsQuery.refetch();
        callback();
      })
      .catch(e => {
        Alert.error(e.message);
      });
  };

  const updatedProps = {
    ...props,
    tags: tagsQuery.tags || [],
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

export default compose(
  graphql(gql(queries.tags), {
    name: 'tagsQuery',
    options: ({ type } : { type: string }) => ({
      variables: { type },
      fetchPolicy: 'network-only'
    })
  }),
  graphql(gql(mutations.add), { name: 'addMutation', options }),
  graphql(gql(mutations.edit), { name: 'editMutation', options }),
  graphql(gql(mutations.remove), { name: 'removeMutation', options })
)(ListContainer);
