import { gql } from '@apollo/client';
import { graphql } from '@apollo/client/react/hoc';
import Spinner from '@erxes/ui/src/components/Spinner';
import { withProps } from '@erxes/ui/src/utils';
import * as compose from 'lodash.flowright';
import React from 'react';
import { queries } from '../../graphql';
import { ReportTemplatesListQueryResponse } from '../../types';
import ReportFormComponent from '../../components/report/ReportForm';
type Props = {
  searchValue: string;
  serviceName: string;

  history: any;
  queryParams: any;
};

type FinalProps = {
  reportTemplatesListQuery: ReportTemplatesListQueryResponse;
} & Props;

const ReportForm = (props: FinalProps) => {
  const { reportTemplatesListQuery, history, queryParams } = props;

  if (reportTemplatesListQuery.loading) {
    return <Spinner />;
  }

  const { reportTemplatesList = [] } = reportTemplatesListQuery;
  return (
    <ReportFormComponent {...props} reportTemplates={reportTemplatesList} />
  );
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
    )
  )(ReportForm)
);
