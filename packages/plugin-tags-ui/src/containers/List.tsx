import * as compose from 'lodash.flowright';

import { Alert, confirm, withProps } from '@erxes/ui/src/utils';
import {
  MergeMutationResponse,
  RemoveMutationResponse,
  TagsQueryResponse
} from '../types';
import { mutations, queries } from '../graphql';

import ButtonMutate from '@erxes/ui/src/components/ButtonMutate';
import EmptyState from '@erxes/ui/src/components/EmptyState';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import List from '../components/List';
import React from 'react';
import Spinner from '@erxes/ui/src/components/Spinner';
import { __ } from '@erxes/ui/src/utils/core';
import { generatePaginationParams } from '@erxes/ui/src/utils/router';
import { gql } from '@apollo/client';
import { graphql } from '@apollo/client/react/hoc';

type Props = {
  history: any;
  queryParams?: any;
};

type FinalProps = {
  tagsQuery: TagsQueryResponse;
  tagsGetTypes: any;
  tagsQueryCount: any;
} & Props &
  RemoveMutationResponse &
  MergeMutationResponse;

const ListContainer = (props: FinalProps) => {
  const {
    tagsGetTypes,
    tagsQuery,
    tagsQueryCount,
    removeMutation,
    mergeMutation,
    queryParams
  } = props;

  if (tagsGetTypes.loading) {
    return <Spinner />;
  }

  const tagType = queryParams.tagType || '';
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

  if (!tagsQuery || !tagsQueryCount) {
    return (
      <EmptyState
        image="/images/actions/5.svg"
        text={__('No taggable plugin found')}
        size="full"
      />
    );
  }

  const remove = tag => {
    confirm(
      `This action will untag all ${tag.type}(s) with this tag and remove the tag. Are you sure?`
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
    object,
    name
  }: IButtonMutateProps) => {
    return (
      <ButtonMutate
        mutation={object ? mutations.edit : mutations.add}
        variables={values}
        callback={callback}
        refetchQueries={getRefetchQueries(queryParams)}
        isSubmitted={isSubmitted}
        type="submit"
        successMessage={`You successfully ${
          object ? 'updated' : 'added'
        } a ${name}`}
      />
    );
  };

  const total = tagsQueryCount.tagsQueryCount || 0;

  const updatedProps = {
    ...props,
    types,
    tags: tagsQuery.tags || [],
    loading: tagsQuery.loading,
    tagType,
    total,
    remove,
    merge,
    renderButton
  };

  return <List {...updatedProps} />;
};

const getRefetchQueries = queryParams => {
  return [
    {
      query: gql(queries.tags),
      variables: {
        type: queryParams.tagType,
        searchValue: queryParams.searchValue,
        ...generatePaginationParams(queryParams)
      }
    },
    {
      query: gql(queries.tagsQueryCount),
      variables: {
        type: queryParams.tagType,
        searchValue: queryParams.searchValue
      }
    }
  ];
};

export default withProps<Props>(
  compose(
    graphql<Props>(gql(queries.tagsGetTypes), {
      name: 'tagsGetTypes'
    }),
    graphql<Props>(gql(queries.tagsQueryCount), {
      name: 'tagsQueryCount',
      options: ({ queryParams }) => ({
        variables: {
          type: queryParams.tagType,
          searchValue: queryParams.searchValue
        },
        fetchPolicy: 'network-only'
      })
    }),
    graphql<Props, TagsQueryResponse, { type: string }>(gql(queries.tags), {
      name: 'tagsQuery',
      options: ({ queryParams }) => ({
        variables: {
          type: queryParams.tagType,
          searchValue: queryParams.searchValue,
          ...generatePaginationParams(queryParams)
        },
        fetchPolicy: 'network-only'
      })
    }),
    graphql<Props, RemoveMutationResponse, { _id: string }>(
      gql(mutations.remove),
      {
        name: 'removeMutation',
        options: ({ queryParams }: Props) => ({
          refetchQueries: getRefetchQueries(queryParams)
        })
      }
    ),
    graphql<Props, MergeMutationResponse>(gql(mutations.merge), {
      name: 'mergeMutation',
      options: ({ queryParams }: Props) => ({
        refetchQueries: getRefetchQueries(queryParams)
      })
    })
  )(ListContainer)
);
