import * as React from 'react';

import { MockedProvider } from '@apollo/react-testing';
import { GraphQLError } from 'graphql';
import gql from 'graphql-tag';
import { createMemoryHistory } from 'history';
import { brandFactory } from 'modules/testing-utils/factories';
import { withRouter } from 'modules/testing-utils/withRouter';
import { act, create } from 'react-test-renderer';
import wait from 'waait';
import { queries } from '../../graphql';
import SummaryReport from '../SummaryReport';

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

const queryParams = {
  brandIds: '',
  integrationIds: '',
  endDate: '2020-01-09',
  startDate: '2020-01-20'
};

const summaryQueryMock = {
  request: {
    query: gql(queries.responseSummary),
    variables: queryParams
  },
  result: {
    data: {}
  }
};

const summaryErrorMock = {
  request: {
    query: gql(queries.responseSummary),
    variables: queryParams
  },
  result: {
    errors: [new GraphQLError('forced error')]
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
        <SummaryReport queryParams={queryParams} history={history} />
      </MockedProvider>
    );

    const tree = component.toJSON();
    expect(tree.children).toContain('Loading...');
  });

  it('error', async () => {
    const component = create(
      <MockedProvider
        mocks={[brandsMock, summaryErrorMock]}
        addTypename={false}
      >
        {withRouter(
          <SummaryReport queryParams={queryParams} history={history} />
        )}
      </MockedProvider>
    );

    await act(async () => {
      await wait(0);
    });

    const tree = component.toJSON();
    expect(tree.children).toContain('Error!');
  });

  it('should render content', async () => {
    const component = create(
      <MockedProvider
        mocks={[brandsMock, summaryQueryMock]}
        addTypename={false}
      >
        {withRouter(
          <SummaryReport queryParams={queryParams} history={history} />
        )}
      </MockedProvider>
    );

    await wait(0); // wait for response

    const tree = component.toJSON();
    expect(tree).toBe(null);
  });
});
