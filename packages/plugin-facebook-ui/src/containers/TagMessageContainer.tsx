import { gql } from '@apollo/client';
import * as compose from 'lodash.flowright';
import { graphql } from '@apollo/client/react/hoc';
import React from 'react';

import { withProps } from '@erxes/ui/src/utils';
import Spinner from '@erxes/ui/src/components/Spinner';

import TagMessage from '../components/conversationDetail/workarea/TagMessage';
import { queries } from '../graphql';
import { TaggedMessagesQueryResponse } from '../types';

type Props = {
  setExtraInfo: (value) => void;
  hideMask: () => void;
  extraInfo: any;
  conversationId: string;
};

type FinalProps = {
  taggedMessagesQuery: TaggedMessagesQueryResponse;
} & Props;

const TagMessageContainer = (props: FinalProps) => {
  const { taggedMessagesQuery } = props;

  if (taggedMessagesQuery.loading) {
    return <Spinner />;
  }

  const updatedProps = {
    ...props,
    hasTaggedMessages: taggedMessagesQuery.facebookHasTaggedMessages
  };

  return <TagMessage {...updatedProps} />;
};

export default withProps<Props>(
  compose(
    graphql<Props>(gql(queries.facebookHasTaggedMessages), {
      name: 'taggedMessagesQuery',
      options: ({ conversationId }: Props) => ({
        fetchPolicy: 'network-only',
        variables: { conversationId }
      })
    })
  )(TagMessageContainer)
);
