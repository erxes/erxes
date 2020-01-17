import * as React from 'react';

import { createMemoryHistory } from 'history';
import { router } from 'modules/common/utils';
import { formatDate } from 'modules/insights/utils';
import { withRouter } from 'modules/testing-utils/withRouter';
import Filter from '../../filter/Filter';

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

const onApplyClick = ({ startDate, endDate }) => {
  router.setParams(history, {
    integrationIds: [].join(','),
    brandIds: [].join(','),
    startDate: formatDate(startDate),
    endDate: formatDate(endDate)
  });
};

describe('Insight main filter', () => {
  it('should render loading state initially', () => {
    withRouter(
      <Filter
        content={<div>filter test</div>}
        queryParams={queryParamsMock}
        history={history}
        onApplyClick={onApplyClick}
      />,
      { route, history }
    );
  });
});
