import { gql } from '@apollo/client';
import * as compose from 'lodash.flowright';
import { graphql } from '@apollo/client/react/hoc';
import { withProps } from '@erxes/ui/src/utils';
import SideBar from '../../components/zms/SideBar';
import { IZms, LogResponse, ZmsResponse } from '../../types';
import { queries } from '../../graphql';
import React from 'react';
import Spinner from '@erxes/ui/src/components/Spinner';

type Props = {
  Zmss: IZms;
  id?: string;
};

type FinalProps = {
  getZmsQuery: ZmsResponse;
  listQuery: LogResponse;
} & Props;
const TypesListContainer = (props: FinalProps) => {
  const { getZmsQuery, listQuery } = props;

  if (getZmsQuery.loading) {
    return <Spinner />;
  }

  // calls gql mutation for edit/add type

  const updatedProps = {
    ...props,
    zmss: getZmsQuery.getZmses || [],
    logs: listQuery.getZmsLogs || [],
    loading: getZmsQuery.loading
  };
  return <SideBar {...updatedProps} />;
};

export default withProps<Props>(
  compose(
    graphql(gql(queries.listZmss), {
      name: 'getZmsQuery',
      options: () => ({
        fetchPolicy: 'network-only'
      })
    }),
    graphql<Props, LogResponse, { zmsId: string }>(gql(queries.listZmsLogs), {
      name: 'listQuery',
      options: ({ id }) => {
        return {
          variables: {
            zmsId: id || ''
          },
          fetchPolicy: 'network-only'
        };
      }
    })
  )(TypesListContainer)
);
