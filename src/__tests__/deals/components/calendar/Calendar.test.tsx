// test failed info: Invariant Violation: You should not use <Route> or withRouter() outside a <Router>
import { mount, shallow } from 'enzyme';
import CalendarView from 'modules/deals/components/calendar/Calendar';
import * as React from 'react';
import { MockedProvider } from 'react-apollo/test-utils';
import { BrowserRouter as Router } from 'react-router-dom';

describe('CalendarView component', () => {
  const defaultProps = {
    queryParams: 'e2321'
  };

  test('renders successfully', () => {
    shallow(
      <MockedProvider>
        <Router>
          <CalendarView {...defaultProps} />
        </Router>
      </MockedProvider>
    );
  });

  test('renders with default props', () => {
    const control = mount(
      <MockedProvider>
        <Router>
          <CalendarView {...defaultProps} />
        </Router>
      </MockedProvider>
    );
    const props = control.props();

    expect(props).toMatchObject(defaultProps);
  });
});
