import gql from 'graphql-tag';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import { MessageForm } from '../components';
import { queries } from '../graphql';

type Props = {
  kind: string;
  engageMessageDetailQuery: any;
  brandsQuery: any;
};

const MessageFormContainer = (props : Props) => {
  const { engageMessageDetailQuery, brandsQuery, kind } = props;

  if (engageMessageDetailQuery.loading || brandsQuery.loading) {
    return null;
  }

  const message = engageMessageDetailQuery.engageMessageDetail;
  const brands = brandsQuery.brands || [];

  const updatedProps = {
    ...props,
    kind: message ? message.kind : kind,
    brands,
    scheduleDate: message ? message.scheduleDate : {}
  };

  return <MessageForm {...updatedProps} />;
};

export default compose(
  graphql(gql(queries.engageMessageDetail), {
    name: 'engageMessageDetailQuery',
    options: ({ messageId } : { messageId: string }) => ({
      variables: {
        _id: messageId
      }
    })
  }),
  graphql(gql(queries.brands), { name: 'brandsQuery' })
)(MessageFormContainer);
