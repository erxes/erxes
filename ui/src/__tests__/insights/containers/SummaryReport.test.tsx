import * as React from 'react';

import { MockedProvider } from '@apollo/react-testing';
import gql from 'graphql-tag';
import { createMemoryHistory } from 'history';
import { create } from 'react-test-renderer';
import wait from 'waait';
import SummaryReport from '../../../modules/insights/containers/SummaryReport';
import { queries } from '../../../modules/insights/graphql';
import { brandFactory } from '../../../testing-utils/factories';
import { withRouter } from '../../../testing-utils/withRouter';

const brandsMock = {
  request: {
    query: gql(queries.brands),
    variables: {}
  },
  result: {
    data: {
      brands: [
        brandFactory.build(),
        brandFactory.build({
          _id: '2',
          name: 'Erkhet'
        })
      ]
    }
  }
};

const queryParamsMock = {
  brandIds: '',
  integrationIds: '',
  endDate: '2020-01-09',
  startDate: '2020-01-20'
};

const summaryQueryMock = {
  request: {
    query: gql(queries.responseSummary),
    variables: queryParamsMock
  },
  result: {
    data: {
      insightsConversation: {}
    }
  }
};

const route = '/inbox/insights/summary-report';
const history = createMemoryHistory({
  initialEntries: [route]
});

describe('Summary Report', () => {
  it('should render loading state initially', () => {
    const component = create(
      <MockedProvider mocks={[]}>
        <SummaryReport queryParams={queryParamsMock} history={history} />
      </MockedProvider>
    );

    const tree = component.toJSON();
    expect(tree.children).toContain('Loading...');
  });

  it('error', async () => {
    const component = create(
      <MockedProvider
        mocks={[brandsMock, summaryQueryMock]}
        addTypename={false}
      >
        {withRouter(
          <SummaryReport queryParams={queryParamsMock} history={history} />
        )}
      </MockedProvider>
    );

    await wait(0); // wait for response

    // const tree = component.root;
    // expect(tree.children).toContain('Error!');
  });
});
