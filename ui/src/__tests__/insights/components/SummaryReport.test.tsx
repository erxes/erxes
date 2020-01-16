import * as React from 'react';

import { createMemoryHistory } from 'history';
import SummaryReport from '../../../modules/insights/components/SummaryReport';
import { brandFactory } from '../../../testing-utils/factories';
import { withRouter } from '../../../testing-utils/withRouter';

const brands = [
  brandFactory.build(),
  brandFactory.build({
    _id: '2',
    name: 'Erkhet',
    code: 'erkhet'
  })
];

const queryParamsMock = {
  brandIds: '',
  integrationIds: '',
  boardId: '',
  pipelineIds: '',
  endDate: '2020-01-09',
  startDate: '2020-01-20'
};

const route = '/inbox/insights/summary-report';
const history = createMemoryHistory({
  initialEntries: [route]
});

describe('Summary Reports', () => {
  it('should render loading state initially', () => {
    withRouter(
      <SummaryReport
        brands={brands}
        trend={[]}
        history={{ history }}
        loading={false}
        queryParams={queryParamsMock}
        summary={[]}
      />,
      { route, history }
    );
  });
});
