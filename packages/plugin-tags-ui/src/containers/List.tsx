import { __ } from '@erxes/ui/src/utils/core';
import * as compose from 'lodash.flowright';

import { Alert, confirm, withProps } from '@erxes/ui/src/utils';
import {
  MergeMutationResponse,
  RemoveMutationResponse,
  TagsQueryResponse
} from '../types';
import { mutations, queries } from '../graphql';

import ButtonMutate from '@erxes/ui/src/components/ButtonMutate';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import List from '../components/List';
import React from 'react';
import Spinner from '@erxes/ui/src/components/Spinner';
import { gql } from '@apollo/client';
import { graphql } from '@apollo/client/react/hoc';
import { router } from '@erxes/ui/src/utils';
import EmptyState from '@erxes/ui/src/components/EmptyState';

type Props = {
  history: any;
  type: string;
};

type FinalProps = {
  tagsQuery: TagsQueryResponse;
  tagsGetTypes: any;
} & Props &
  RemoveMutationResponse &
  MergeMutationResponse;

const ListContainer = (props: FinalProps) => {
  const {
    tagsGetTypes,
    tagsQuery,
    removeMutation,
    type,
    mergeMutation,
    history
  } = props;

  if (tagsGetTypes.loading) {
    return <Spinner />;
  }

  const types = tagsGetTypes.tagsGetTypes || [];

  if (types.length === 0) {
    return (
      <EmptyState
        image="/images/actions/5.svg"
        text={__('No taggable plugin found')}
        size="full"
      />
    );
  }

  if (!router.getParam(history, 'type') || !tagsQuery) {
    router.setParams(
      history,
      { type: types.length !== 0 ? types[0].contentType.toString() : '' },
      true
    );
  }

  if (!tagsQuery) {
    return (
      <EmptyState
        image="/images/actions/5.svg"
        text={__('No taggable plugin found')}
        size="full"
      />
    );
  }

  if (tagsQuery.loading) {
    return <Spinner />;
  }

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
    types,
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
      variables: { type: type || '' }
    }
  ];
};

export default withProps<Props>(
  compose(
    graphql<Props>(gql(queries.tagsGetTypes), {
      name: 'tagsGetTypes'
    }),
    graphql<Props, TagsQueryResponse, { type: string }>(gql(queries.tags), {
      name: 'tagsQuery',
      options: ({ type }) => ({
        variables: { type },
        fetchPolicy: 'network-only'
      }),
      skip: ({ type }) => !type
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
