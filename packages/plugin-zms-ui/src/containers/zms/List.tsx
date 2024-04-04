import { gql } from '@apollo/client';
import * as compose from 'lodash.flowright';
import { graphql } from '@apollo/client/react/hoc';
import { withProps } from '@erxes/ui/src/utils';
import List from '../../components/zms/List';
import { LogResponse } from '../../types';
import { queries } from '../../graphql';
import React from 'react';
import Spinner from '@erxes/ui/src/components/Spinner';

type Props = {
  log: any;
  id: string;
};

type FinalProps = {
  listQuery: LogResponse;
} & Props;

const ListContainer = (props: FinalProps) => {
  const { listQuery } = props;

  if (listQuery.loading) {
    return <Spinner />;
  }
  const updatedProps = {
    ...props,
    logs: listQuery.getZmsLogs || [],
    loading: listQuery.loading
  };
  return <List {...updatedProps} />;
};

export default withProps<Props>(
  compose(
    graphql<Props, LogResponse, { zmsId: string }>(gql(queries.listZmsLogs), {
      name: 'listQuery',
      options: ({ id }) => {
        return {
          variables: {
            zmsId: id
          }
        };
      }
    })
  )(ListContainer)
);
