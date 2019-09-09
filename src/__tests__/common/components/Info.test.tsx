import { shallow } from 'enzyme';
import React from 'react';

import Info from '../../../modules/common/components/Info';

describe('Info component', () => {
  const defaultProps = {
    children: 'child'
  };

  test('renders Info successfully', () => {
    shallow(<Info {...defaultProps} />);
  });
});
