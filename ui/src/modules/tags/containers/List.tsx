import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import ButtonMutate from 'modules/common/components/ButtonMutate';
import { IButtonMutateProps } from 'modules/common/types';
import { Alert, confirm, withProps } from 'modules/common/utils';
import React from 'react';
import { graphql } from 'react-apollo';
import List from '../components/List';
import { mutations, queries } from '../graphql';
import {
  MergeMutationResponse,
  RemoveMutationResponse,
  TagsQueryResponse
} from '../types';

type Props = {
  type: string;
};

type FinalProps = {
  tagsQuery: TagsQueryResponse;
} & Props &
  RemoveMutationResponse &
  MergeMutationResponse;

const ListContainer = (props: FinalProps) => {
  const { tagsQuery, removeMutation, type, mergeMutation } = props;

  const remove = tag => {
    confirm(
      `This action will untag all ${type}(s) with this tag and remove the tag. Are you sure?`
    )
      .then(() => {
        removeMutation({ variables: { _id: tag._id } })
          .then(() => {
            Alert.success('You successfully deleted a tag');
            tagsQuery.refetch();
          })
          .catch(e => {
            Alert.error(e.message);
          });
      })
      .catch(e => {
        Alert.error(e.message);
      });
  };

  const merge = (sourceId: string, destId: string, callback) => {
    mergeMutation({ variables: { sourceId, destId } })
      .then(() => {
        callback();
        Alert.success('You successfully merged tags');
        tagsQuery.refetch();
      })
      .catch(e => {
        Alert.error(e.message);
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
        successMessage={`You successfully ${
          object ? 'updated' : 'added'
        } a ${name}`}
      />
    );
  };

  const updatedProps = {
    ...props,
    tags: tagsQuery.tags || [],
    loading: tagsQuery.loading,
    type,
    remove,
    merge,
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
    graphql<Props, RemoveMutationResponse, { _id: string }>(
      gql(mutations.remove),
      {
        name: 'removeMutation',
        options: ({ type }: Props) => ({
          refetchQueries: getRefetchQueries(type)
        })
      }
    ),
    graphql<Props, MergeMutationResponse>(gql(mutations.merge), {
      name: 'mergeMutation',
      options: ({ type }: Props) => ({
        refetchQueries: getRefetchQueries(type)
      })
    })
  )(ListContainer)
);
