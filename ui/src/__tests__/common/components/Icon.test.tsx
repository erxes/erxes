import { shallow } from 'enzyme';
import React from 'react';
import Icon from '../../../modules/common/components/Icon';

describe('Icon component', () => {
  const defaultProps = {
    icon: 'upload-1',
    size: 30,
    isActive: false
  };

  test('renders successfully', () => {
    const wrapper = shallow(<Icon {...defaultProps} />);
    expect(wrapper).not.toBe('');
  });
});
