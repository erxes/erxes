import { gql } from '@apollo/client';
import { graphql } from '@apollo/client/react/hoc';
import Spinner from '@erxes/ui/src/components/Spinner';
import { withProps } from '@erxes/ui/src/utils';
import * as compose from 'lodash.flowright';
import React from 'react';
import { router } from '@erxes/ui/src/utils';
import { queries } from '../../graphql';
import { ReportTemplatesListQueryResponse } from '../../types';
import ReportFormComponent from '../../components/report/ReportForm';
type Props = {
  searchValue: string;
  charts: string[];
  serviceName: string;

  history: any;
  queryParams: any;
};

type FinalProps = {
  reportTemplatesListQuery: ReportTemplatesListQueryResponse;
} & Props;

const ReportForm = (props: FinalProps) => {
  const { reportTemplatesListQuery, history, queryParams } = props;

  console.log('yamate   ', reportTemplatesListQuery.reportTemplatesList);

  return <ReportFormComponent {...props} />;
};

export default withProps<Props>(
  compose(
    graphql<Props, any, { searchValue: string }>(
      gql(queries.reportTemplatesList),
      {
        name: 'reportTemplatesListQuery',
        options: ({ searchValue }) => ({
          variables: { searchValue },
          fetchPolicy: 'network-only'
        })
      }
    ),
    graphql<Props, any, { serviceName: string; charts: string[] }>(
      gql(queries.reportChartTemplatesList),
      {
        name: 'reportChartTemplatesListQuery',
        options: ({ serviceName, charts }) => ({
          variables: { serviceName, charts },
          fetchPolicy: 'network-only'
        })
      }
    )
  )(ReportForm)
);
