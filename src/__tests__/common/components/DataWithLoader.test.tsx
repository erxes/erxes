import { shallow } from 'enzyme';
import React from 'react';

import DataWithLoader from '../../../modules/common/components/DataWithLoader';

describe('DataWithLoader component', () => {
  const defaultProps = {
    data: 'today',
    loading: false
  };

  test('renders DataWithLoader successfully', () => {
    const wrapper = shallow(<DataWithLoader {...defaultProps} />);
    expect(wrapper).not.toBe('');
  });
});
