import * as compose from 'lodash.flowright';

import { IConversation, IMessage } from '@erxes/ui-inbox/src/inbox/types';

import ConvertTo from '../../../components/conversationDetail/workarea/ConvertTo';
import React from 'react';
import { gql } from '@apollo/client';
import { graphql } from '@apollo/client/react/hoc';
import { queries } from '@erxes/ui-inbox/src/inbox/graphql';
import { withProps } from '@erxes/ui/src/utils';

type Props = {
  conversation: IConversation;
  conversationMessage: IMessage;
};

type FinalProps = {
  convertToInfoQuery: any;
} & Props;
class ConvertToInfoContainer extends React.Component<FinalProps> {
  shouldComponentUpdate(nextProps: FinalProps) {
    if (
      nextProps.convertToInfoQuery.convertToInfo !==
        this.props.convertToInfoQuery.convertToInfo ||
      this.props.conversation !== nextProps.conversation
    ) {
      return true;
    }

    return false;
  }

  render() {
    const { convertToInfoQuery } = this.props;

    const updatedProps = {
      ...this.props,
      convertToInfo: convertToInfoQuery.convertToInfo || {},
      refetch: convertToInfoQuery.refetch
    };

    return <ConvertTo {...updatedProps} />;
  }
}

export default withProps<Props>(
  compose(
    graphql(gql(queries.convertToInfo), {
      name: 'convertToInfoQuery',
      options: ({ conversation }: Props) => ({
        variables: { conversationId: conversation._id }
      })
    })
  )(ConvertToInfoContainer)
);
