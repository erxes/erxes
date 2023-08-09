import * as compose from 'lodash.flowright';

import { withProps } from '@erxes/ui/src/utils';
import { queries } from '../graphql';

import React from 'react';
import { gql } from '@apollo/client';
import { graphql } from '@apollo/client/react/hoc';
import DumpConversationDetailActionBar from '../components/ConversationDetailActionBar';

type Props = {
  conversation;
  analysisQuery;
};

const ConversationDetailActionBar = (props: Props) => {
  const { analysisQuery } = props;

  const analysis = analysisQuery.zerocodeaiGetAnalysis || '';

  if (!analysis) {
    return null;
  }

  const updatedProps = {
    analysis
  };

  return <DumpConversationDetailActionBar {...updatedProps} />;
};

export default withProps<Props>(
  compose(
    graphql<Props>(gql(queries.getAnalysis), {
      name: 'analysisQuery',
      options: ({ conversation }) => ({
        variables: {
          contentType: 'inbox:conversation',
          contentTypeId: conversation._id
        }
      })
    })
  )(ConversationDetailActionBar)
);
