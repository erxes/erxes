import { shallow } from 'enzyme';
import React from 'react';

import Avatar from '../../../../modules/common/components/nameCard/Avatar';

describe('Avatar component', () => {
  test('renders Avatar successfully', () => {
    shallow(<Avatar />);
  });
});
