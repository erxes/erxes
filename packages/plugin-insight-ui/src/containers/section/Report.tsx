import React from 'react';

import { gql, useQuery, useMutation } from '@apollo/client';

import Alert from '@erxes/ui/src/utils/Alert/index';
import confirm from '@erxes/ui/src/utils/confirmation/confirm';
import { __ } from '@erxes/ui/src/utils/index';
import { router } from '@erxes/ui/src/utils';

import ReportSection from '../../components/section/Report';
import { queries, mutations } from '../../graphql';
import {
  ReportRemoveMutationResponse,
  ReportsListQueryResponse,
  SectionsListQueryResponse,
} from '../../types';

type Props = {
  history: any;
  queryParams: any;
};

const ReportSectionContainer = (props: Props) => {
  const { queryParams, history } = props;
  const { goalId, dashboardId, reportId } = queryParams;

  const reportsQuery = useQuery<ReportsListQueryResponse>(
    gql(queries.reportList),
  );
  const sectionsQuery = useQuery<SectionsListQueryResponse>(
    gql(queries.sectionList),
    {
      variables: {
        type: 'report',
      },
    },
  );

  const [reportsRemoveManyMutation] = useMutation<ReportRemoveMutationResponse>(
    gql(mutations.reportsRemove),
    {
      refetchQueries: [
        {
          query: gql(queries.sectionList),
          variables: { type: 'report' },
        },
        {
          query: gql(queries.reportList),
        },
      ],
    },
  );

  const removeReports = (ids: string[]) => {
    confirm(__('Are you sure to delete selected reports?')).then(() => {
      reportsRemoveManyMutation({ variables: { ids } })
        .then(() => {
          if (ids.includes(queryParams.reportId)) {
            router.removeParams(history, ...Object.keys(queryParams));
          }
          Alert.success(__('Successfully deleted'));
        })
        .catch((e: Error) => Alert.error(e.message));
    });
  };

  const sections = sectionsQuery?.data?.sections || [];
  const { list = [], totalCount = 0 } = reportsQuery?.data?.reportsList || {};

  const updatedProps = {
    ...props,
    reports: list,
    sections,
    removeReports,
  };

  return <ReportSection {...updatedProps} />;
};

export default ReportSectionContainer;
