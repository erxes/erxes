import React from 'react';
import * as compose from 'lodash.flowright';
import { graphql } from '@apollo/client/react/hoc';
import { gql } from '@apollo/client';

import ChartForm from '../../components/chart/ChartForm';
import { queries } from '../../graphql';
import { ReportTemplatesListQueryResponse } from '../../types';
type Props = {
  history: any;
  queryParams: any;
  toggleForm: () => void;
  showChatForm: boolean;
};

type FinalProps = {
  reportTemplatesListQuery: ReportTemplatesListQueryResponse;
} & Props;

const ChartFormList = (props: FinalProps) => {
  const { reportTemplatesListQuery } = props;

  const { reportTemplatesList = [] } = reportTemplatesListQuery;

  return <ChartForm reportTemplates={reportTemplatesList} {...props} />;
};

export default compose(
  graphql<Props, any, {}>(gql(queries.reportTemplatesList), {
    name: 'reportTemplatesListQuery',
    options: () => ({
      variables: {},
      fetchPolicy: 'network-only'
    })
  })
)(ChartFormList);
