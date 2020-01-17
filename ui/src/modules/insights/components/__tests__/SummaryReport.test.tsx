import * as React from 'react';

import { createMemoryHistory } from 'history';
import { brandFactory } from 'modules/testing-utils/factories';
import { withRouter } from 'modules/testing-utils/withRouter';
import { create } from 'react-test-renderer';
import SummaryReport from '../SummaryReport';

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
    const test = create(
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
      )
    );

    console.log(test);
  });
});
