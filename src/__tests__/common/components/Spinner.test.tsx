import { shallow } from 'enzyme';
import React from 'react';

import Spinner from '../../../modules/common/components/Spinner';

describe('Spinner component', () => {
  const defaultProps = {
    objective: true
  };

  test('renders Spinner successfully', () => {
    const wrapper = shallow(<Spinner {...defaultProps} />);
    expect(wrapper).not.toBe('');
  });
});
