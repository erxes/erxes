import { gql } from '@apollo/client';
import { graphql } from '@apollo/client/react/hoc';
import Spinner from '@erxes/ui/src/components/Spinner';
import { withProps } from '@erxes/ui/src/utils';
import * as compose from 'lodash.flowright';
import React from 'react';
import { queries } from '../../graphql';
import { ReportChartTemplatesListQueryResponse } from '../../types';
import ReportFormModalComponent from '../../components/report/ReportFormModal';
type Props = {
  history: any;
  queryParams: any;

  charts?: string[];
  serviceName?: string;
  emptyReport?: boolean;
};

type FinalProps = {
  reportChartTemplatesListQuery: ReportChartTemplatesListQueryResponse;
} & Props;

const ReportFormModal = (props: FinalProps) => {
  const { reportChartTemplatesListQuery, history, queryParams } = props;

  if (reportChartTemplatesListQuery?.loading) {
    return <Spinner />;
  }

  return (
    <ReportFormModalComponent
      {...props}
      chartTemplates={
        reportChartTemplatesListQuery?.reportChartTemplatesList || []
      }
    />
  );
};

export default withProps<Props>(
  compose(
    graphql<Props, any, { serviceName?: string; charts?: string[] }>(
      gql(queries.reportChartTemplatesList),
      {
        name: 'reportChartTemplatesListQuery',
        skip: ({ emptyReport }) => emptyReport || false,
        options: ({ serviceName, charts }) => ({
          variables: { serviceName, charts },
          fetchPolicy: 'network-only'
        })
      }
    )
  )(ReportFormModal)
);
