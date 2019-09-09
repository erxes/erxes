import { mount, shallow } from 'enzyme';
import React from 'react';

import Summary from '../../modules/insights/components/Summary';

describe('Summary component', () => {
  const defaultProps = {
    data: [],
    loading: false
  };

  test('renders Summary successfully', () => {
    shallow(<Summary {...defaultProps} />);
  });
});
