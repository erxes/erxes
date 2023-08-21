import * as compose from 'lodash.flowright';

import {
  ITagTypes,
  TagMutationResponse,
  TagMutationVariables,
  TagsQueryResponse
} from '../types';

import React from 'react';
import Tagger from '../components/Tagger';
import { gql } from '@apollo/client';
import { graphql } from '@apollo/client/react/hoc';
import { Alert, withProps } from '@erxes/ui/src/utils';

type Props = {
  // targets can be conversation, customer, company etc ...
  targets?: any[];
  event?: 'onClick' | 'onExit';
  type: ITagTypes | string;
  successCallback?: () => void;
  className?: string;
  refetchQueries?: any[];
  parentTagId?: string;
  singleSelect?: boolean;
};

type FinalProps = {
  tagsQuery: TagsQueryResponse;
} & Props &
  TagMutationResponse;

const TaggerContainer = (props: FinalProps) => {
  const { type, targets = [], successCallback, tagsQuery, tagMutation } = props;

  const tag = selectedTagIds => {
    const variables = {
      type,
      targetIds: targets.map(t => t._id),
      tagIds: selectedTagIds
    };

    tagMutation({ variables })
      .then(() => {
        let message = `The ${type} has been tagged!`;

        if (targets.length > 1) {
          message = `Selected ${type}s have been tagged!`;
        }

        Alert.success(message);

        if (successCallback) {
          successCallback();
        }
      })
      .catch(error => {
        Alert.error(error.message);
      });
  };

  const updatedProps = {
    ...props,
    loading: tagsQuery.loading,
    tags: tagsQuery.tags || [],
    tag
  };

  return <Tagger {...updatedProps} />;
};

const query = gql`
  query($type: String!, $tagIds: [String], $parentId: String) {
    tags(type: $type, tagIds: $tagIds, parentId: $parentId) {
      _id
      name
      colorCode
      parentId
    }
  }
`;

const mutation = gql`
  mutation tagsTag(
    $type: String!
    $targetIds: [String!]!
    $tagIds: [String!]!
  ) {
    tagsTag(type: $type, targetIds: $targetIds, tagIds: $tagIds)
  }
`;

export default withProps<Props>(
  compose(
    graphql<Props, TagsQueryResponse, { type: string }>(query, {
      name: 'tagsQuery',
      options: (props: Props) => ({
        variables: {
          type: props.type,
          parentId: props.parentTagId
        }
      })
    }),
    graphql<Props, TagMutationResponse, TagMutationVariables>(mutation, {
      name: 'tagMutation',
      options: ({ refetchQueries }) => ({
        refetchQueries
      })
    })
  )(TaggerContainer)
);
