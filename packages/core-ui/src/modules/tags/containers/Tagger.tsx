import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import { Alert, withProps } from 'modules/common/utils';
import React from 'react';
import { graphql } from 'react-apollo';
import Tagger from '../components/Tagger';
import {
  ITagTypes,
  TagMutationResponse,
  TagMutationVariables,
  TagsQueryResponse
} from '../types';

type Props = {
  // targets can be conversation, customer, company etc ...
  targets?: any[];
  event?: 'onClick' | 'onExit';
  type: ITagTypes | string;
  successCallback?: () => void;
  className?: string;
  refetchQueries?: any[];
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
  query($type: String!) {
    tags(type: $type) {
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
        variables: { type: props.type }
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
