import { MockedProvider, MockedResponse } from '@apollo/react-testing';
import { render } from '@testing-library/react';
import { createMemoryHistory } from 'history';
import * as React from 'react';
import { Router, Switch } from 'react-router-dom';

export default (
  node: JSX.Element | null,
  mocks?: MockedResponse[],
  {
    route = '/',
    history = createMemoryHistory({ initialEntries: [route] })
  } = {}
) => {
  return {
    history,
    ...render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <Router history={history}>
          <Switch>{node}</Switch>
        </Router>
      </MockedProvider>
    )
  };
};
