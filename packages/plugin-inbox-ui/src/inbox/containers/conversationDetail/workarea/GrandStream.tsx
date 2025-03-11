import * as compose from 'lodash.flowright';
import { IConversation, IMessage } from '@erxes/ui-inbox/src/inbox/types';
import Post from '../../../components/conversationDetail/workarea/Post';
import React from 'react';
import { gql } from '@apollo/client';
import { graphql } from '@apollo/client/react/hoc';
import { mutations, queries } from '@erxes/ui-inbox/src/inbox/graphql';
import { withProps } from '@erxes/ui/src/utils';
import Spinner from '@erxes/ui/src/components/Spinner';

type Props = {
  conversation: IConversation;
  conversationMessage: IMessage;
};

type FinalProps = {
  conversationMessage: any;
} & Props;

class PostInfoContainer extends React.Component<FinalProps> {
  render() {
    const { postQuery } = this.props;

    if (postQuery.loading) {
      return <Spinner />;
    }
    if (postQuery.facebookGetPost !== null) {
      const updatedProps = {
        ...this.props,
        PostInfo: postQuery.facebookGetPost || [],
      };

      return <Post {...updatedProps} />;
    } else {
      return null;
    }
  }
}

export default withProps<Props>(
  compose(
    graphql(gql(mutations.syncCallRecordFile), {
      name: 'syncCallRecordFile',
      options: ({ acctId }: Props) => ({
        variables: { acctId: acctId },
      }),
    }),
  )(PostInfoContainer),
);
