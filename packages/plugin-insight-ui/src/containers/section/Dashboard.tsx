import React from 'react';

import { gql, useQuery, useMutation } from '@apollo/client';

import Alert from '@erxes/ui/src/utils/Alert/index';
import confirm from '@erxes/ui/src/utils/confirmation/confirm';
import { __ } from '@erxes/ui/src/utils/index';
import { router } from '@erxes/ui/src/utils';

import DashboardSection from '../../components/section/Dashboard';
import { queries, mutations } from '../../graphql';
import {
  DashboardsListQueryResponse,
  SectionsListQueryResponse,
} from '../../types';

type Props = {
  history: any;
  queryParams: any;
};

const DashboardSectionContainer = (props: Props) => {
  const { queryParams, history } = props;
  const { goalId, dashboardId, reportId } = queryParams;

  const dashboardsQuery = useQuery<DashboardsListQueryResponse>(
    gql(queries.dashboardList),
  );
  const sectionsQuery = useQuery<SectionsListQueryResponse>(
    gql(queries.sectionList),
    {
      variables: {
        type: 'dashboard',
      },
    },
  );

  const [dashboardRemove] = useMutation(gql(mutations.dashboardRemove), {
    refetchQueries: [
      {
        query: gql(queries.sectionList),
        variables: { type: 'dashboard' },
      },
      {
        query: gql(queries.dashboardList),
      },
    ],
  });

  const removeDashboard = (id: string) => {
    confirm(__('Are you sure to delete selected dashboard?')).then(() => {
      dashboardRemove({
        variables: { id },
      })
        .then(() => {
          router.removeParams(history, 'dashboardId');

          Alert.success('You successfully deleted a dashboard');
        })
        .catch((e) => {
          Alert.error(e.message);
        });
    });
  };

  const sections = sectionsQuery?.data?.sections || [];
  const dashboards = dashboardsQuery?.data?.dashboards || [];

  const updatedProps = {
    ...props,
    sections,
    dashboards,
    removeDashboard,
  };

  return <DashboardSection {...updatedProps} />;
};

export default DashboardSectionContainer;
