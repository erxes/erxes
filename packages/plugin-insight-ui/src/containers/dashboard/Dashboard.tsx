import React from 'react';

import Alert from '@erxes/ui/src/utils/Alert/index';
import confirm from '@erxes/ui/src/utils/confirmation/confirm';
import { gql, useQuery, useMutation } from '@apollo/client';
import { __ } from '@erxes/ui/src/utils/index';
import { router } from '@erxes/ui/src/utils';

import Dashboard from '../../components/dashboard/Dashboard';
import { queries, mutations } from '../../graphql';
import {
  DashboardDetailQueryResponse,
  DashboardRemoveMutationResponse,
  IDashboard,
  IReport,
} from '../../types';

type Props = {
  history: any;
  queryParams: any;
};

const DashboardContainer = (props: Props) => {
  const { queryParams, history } = props;

  const dashboardDetailQuery = useQuery<DashboardDetailQueryResponse>(
    gql(queries.dashboardDetail),
    {
      skip: !queryParams.dashboardId,
      variables: {
        id: queryParams.dashboardId,
      },
      fetchPolicy: 'network-only',
    },
  );

  const [dashboardDuplicateMutation] = useMutation(
    gql(mutations.dashboardDuplicate),
    {
      refetchQueries: [
        {
          query: gql(queries.sectionList),
          variables: { type: 'dashboard' },
        },
        {
          query: gql(queries.dashboardList),
        },
      ],
    },
  );

  const [dashboardRemoveMutation] =
    useMutation<DashboardRemoveMutationResponse>(
      gql(mutations.dashboardRemove),
      {
        refetchQueries: [
          {
            query: gql(queries.dashboardList),
          },
        ],
      },
    );

  const dashboardDuplicate = (_id: string) => {
    dashboardDuplicateMutation({ variables: { _id } })
      .then((res) => {
        Alert.success('Successfully duplicated a dashboard');
        const { _id } = res.data.dashboardDuplicate;
        if (_id) {
          history.push(`/insight?dashboardId=${_id}`);
        }
      })
      .catch((err) => {
        Alert.error(err.message);
      });
  };

  const dashboardRemove = (id: string) => {
    confirm(__('Are you sure to delete selected dashboard?')).then(() => {
      dashboardRemoveMutation({ variables: { id } })
        .then(() => {
          if (queryParams.dashboardId === id) {
            router.removeParams(history, ...Object.keys(queryParams));
          }
          Alert.success(__('Successfully deleted a dashboard'));
        })
        .catch((e: Error) => Alert.error(e.message));
    });
  };

  const [dashboardChartsEditMutation] = useMutation(
    gql(mutations.dashboardChartsEdit),
  );

  const [dashboardChartsRemoveMutation] = useMutation(
    gql(mutations.dashboardChartsRemove),
    {
      refetchQueries: ['dashboards', 'dashboardDetail'],
    },
  );

  const dashboardChartsEdit = (_id: string, values: any) => {
    dashboardChartsEditMutation({ variables: { _id, ...values } });
  };

  const dashboardChartsRemove = (_id: string) => {
    dashboardChartsRemoveMutation({ variables: { _id } })
      .then(() => {
        Alert.success('Successfully removed chart');
      })
      .catch((err) => Alert.error(err.message));
  };

  const dashboard =
    dashboardDetailQuery?.data?.dashboardDetail || ({} as IDashboard);
  const loading = dashboardDetailQuery.loading;

  const updatedProps = {
    ...props,
    dashboard,
    loading,
    dashboardDuplicate,
    dashboardRemove,
    dashboardChartsEdit,
    dashboardChartsRemove,
  };

  return <Dashboard {...updatedProps} />;
};

export default DashboardContainer;
