import { mount, shallow } from 'enzyme';
import * as React from 'react';

import Summary from '../../modules/insights/components/Summary';

describe('Summary component', () => {
  const defaultProps = {
    data: [],
    loading: false
  };

  test('renders Summary successfully', () => {
    shallow(<Summary {...defaultProps} />);
  });

  test('renders successfully with default value', () => {
    const wrapper = mount(<Summary {...defaultProps} />);
    const props = wrapper.props();

    expect(props).toMatchObject(defaultProps);
  });
});
