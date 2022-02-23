import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import { withProps } from '@erxes/ui/src/utils';
import ConvertTo from '../../../components/conversationDetail/workarea/ConvertTo';
import { queries } from '@erxes/ui-inbox/src/inbox/graphql';
import { IConversation, IMessage } from '@erxes/ui-inbox/src/inbox/types';
import React from 'react';
import { graphql } from 'react-apollo';

type Props = {
  conversation: IConversation;
  conversationMessage: IMessage;
};

type FinalProps = {
  convertToInfoQuery: any;
} & Props;

const ConvertToInfoContainer = (props: FinalProps) => {
  const { convertToInfoQuery } = props;

  const updatedProps = {
    ...props,
    convertToInfo: convertToInfoQuery.convertToInfo || {},
    refetch: convertToInfoQuery.refetch
  };

  return <ConvertTo {...updatedProps} />;
};

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
