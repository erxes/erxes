import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import React from 'react';
import { graphql } from 'react-apollo';
import { withProps } from '../../common/utils';
import { BrandsQueryResponse } from '../../settings/brands/types';
import MessageForm from '../components/MessageForm';
import { queries } from '../graphql';
import { EngageMessageDetailQueryResponse } from '../types';

type Props = {
  kind?: string;
  messageId?: string;
};

type FinalProps = {
  engageMessageDetailQuery: EngageMessageDetailQueryResponse;
  brandsQuery: BrandsQueryResponse;
} & Props;

const MessageFormContainer = (props: FinalProps) => {
  const { engageMessageDetailQuery, brandsQuery, kind } = props;

  if (engageMessageDetailQuery.loading || brandsQuery.loading) {
    return null;
  }

  const message = engageMessageDetailQuery.engageMessageDetail;
  const brands = brandsQuery.brands || [];

  let segmentType = 'visitor';

  if (message && message.segments && message.segments.length > 0) {
    const segment = message.segments.pop();
    segmentType = segment ? segment.contentType : '';
  }

  const updatedProps = {
    ...props,
    kind: message ? message.kind : kind,
    segmentType,
    brands,
    scheduleDate: message && message.scheduleDate
  };

  return <MessageForm {...updatedProps} />;
};

export default withProps<Props>(
  compose(
    graphql<Props, EngageMessageDetailQueryResponse, { _id?: string }>(
      gql(queries.engageMessageDetail),
      {
        name: 'engageMessageDetailQuery',
        options: ({ messageId }) => ({
          variables: {
            _id: messageId
          }
        })
      }
    ),
    graphql<Props, BrandsQueryResponse>(gql(queries.brands), {
      name: 'brandsQuery'
    })
  )(MessageFormContainer)
);
