import gql from 'graphql-tag';
import Spinner from 'modules/common/components/Spinner';
import Entry from 'modules/settings/integrations/components/store/Entry';
import { queries } from 'modules/settings/integrations/graphql';
import React from 'react';
import { compose, graphql } from 'react-apollo';
import { withProps } from '../../../common/utils';
import { MessengerAppsCountQueryResponse } from '../types';

type Props = {
  integration: any;
  getClassName: (selectedKind: string) => string;
  toggleBox: (kind: string) => void;
  kind: string;
  queryParams: any;
  totalCount: {
    messenger: number;
    form: number;
    facebook: number;
    gmail: number;
    callpro: number;
    chatfuel: number;
    imap: number;
    office365: number;
    outlook: number;
  };
};

type FinalProps = {
  messengerAppsCountQuery: MessengerAppsCountQueryResponse;
} & Props;

const StoreEntry = (props: FinalProps) => {
  const { messengerAppsCountQuery } = props;

  if (messengerAppsCountQuery.loading) {
    return <Spinner />;
  }

  const messengerAppsCount = messengerAppsCountQuery.messengerAppsCount;

  const updatedProps = {
    ...props,
    messengerAppsCount
  };

  return <Entry {...updatedProps} />;
};

export default withProps<Props>(
  compose(
    graphql<Props>(gql(queries.messengerAppsCount), {
      name: 'messengerAppsCountQuery',
      options: ({ kind }) => {
        return {
          variables: { kind },
          fetchPolicy: 'network-only'
        };
      }
    })
  )(StoreEntry)
);
