import { mount, shallow } from 'enzyme';
import React from 'react';

import HeaderDescription from '../../../modules/common/components/HeaderDescription';

describe('HeaderDescription component', () => {
  const defaultProps = {
    icon: 'email',
    title: 'Email',
    description: 'write your email'
  };

  test('renders HeaderDescription successfully', () => {
    shallow(<HeaderDescription {...defaultProps} />);
  });
});
