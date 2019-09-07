import { mount, shallow } from 'enzyme';
import React from 'react';

import WithPermission from '../../../modules/common/components/WithPermission';

describe('WithPermission component', () => {
  const defaultProps = {
    action: '',
    children: false
  };

  test('renders WithPermission successfully', () => {
    shallow(<WithPermission {...defaultProps} />);
  });
});
