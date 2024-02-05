import React from 'react';
import { gql, useQuery, useMutation } from '@apollo/client';
import { queries, mutations } from '../../../graphql';
import Reports from '../../../components/insight/section/Reports';
import { Alert, __, confirm } from '@erxes/ui/src';

type Props = {
  queryParams: any;
  history: any;
};

const ReportsContainer = (props: Props) => {
  const reportsQuery = useQuery(gql(queries.reportsList));

  const [reportsRemoveManyMutation] = useMutation(
    gql(mutations.reportsRemoveMany),
    {
      refetchQueries: ['reportsList'],
    },
  );

  const removeReports = (ids: string[]) => {
    confirm(__('Are you sure to delete selected reports?')).then(() => {
      reportsRemoveManyMutation({ variables: { ids } })
        .then(() => {
          Alert.success(__('Successfully deleted'));
        })
        .catch((e: Error) => Alert.error(e.message));
    });
  };

  const { list = [], totalCount = 0 } = reportsQuery?.data?.reportsList || {};

  const updatedProps = {
    ...props,
    reports: list,
    removeReports,
  };

  return <Reports {...updatedProps} />;
};

export default ReportsContainer;
