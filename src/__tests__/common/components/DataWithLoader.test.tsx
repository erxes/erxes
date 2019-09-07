import { mount, shallow } from 'enzyme';
import React from 'react';

import DataWithLoader from '../../../modules/common/components/DataWithLoader';

describe('DataWithLoader component', () => {
  const defaultProps = {
    data: 'today',
    loading: false
  };

  test('renders DataWithLoader successfully', () => {
    shallow(<DataWithLoader {...defaultProps} />);
  });
});
