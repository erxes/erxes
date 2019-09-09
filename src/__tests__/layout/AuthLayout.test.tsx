import { shallow } from 'enzyme';
import React from 'react';

import AuthLayout from '../../modules/layout/components/AuthLayout';

describe('AuthLayout component', () => {
  const defaultProps = {
    content: false
  };

  test('renders AuthLayout successfully', () => {
    shallow(<AuthLayout {...defaultProps} />);
  });
});
