import gql from 'graphql-tag';
import { ButtonMutate } from 'modules/common/components';
import { IButtonMutateProps } from 'modules/common/types';
import { __, Alert, confirm, withProps } from 'modules/common/utils';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import { List } from '../components';
import { mutations, queries } from '../graphql';
import { RemoveMutationResponse, TagsQueryResponse } from '../types';

type Props = {
  type: string;
};

type FinalProps = {
  tagsQuery: TagsQueryResponse;
} & Props &
  RemoveMutationResponse;

const ListContainer = (props: FinalProps) => {
  const { tagsQuery, removeMutation, type } = props;

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

  const renderButton = ({
    name,
    values,
    isSubmitted,
    callback,
    object
  }: IButtonMutateProps) => {
    return (
      <ButtonMutate
        mutation={object ? mutations.edit : mutations.add}
        variables={values}
        callback={callback}
        refetchQueries={getRefetchQueries(type)}
        isSubmitted={isSubmitted}
        type="submit"
        icon="send"
        successMessage={`You successfully ${
          object ? 'updated' : 'added'
        } a ${name}`}
      >
        {__('Save')}
      </ButtonMutate>
    );
  };

  const updatedProps = {
    ...props,
    tags: tagsQuery.tags || [],
    loading: tagsQuery.loading,
    type,
    remove,
    renderButton
  };

  return <List {...updatedProps} />;
};

const getRefetchQueries = (type: string) => {
  return [
    {
      query: gql(queries.tags),
      variables: { type }
    }
  ];
};

export default withProps<Props>(
  compose(
    graphql<Props, TagsQueryResponse, { type: string }>(gql(queries.tags), {
      name: 'tagsQuery',
      options: ({ type }) => ({
        variables: { type },
        fetchPolicy: 'network-only'
      })
    }),
    graphql<Props, RemoveMutationResponse, { ids: string[] }>(
      gql(mutations.remove),
      {
        name: 'removeMutation',
        options: ({ type }: Props) => ({
          refetchQueries: getRefetchQueries(type)
        })
      }
    )
  )(ListContainer)
);
