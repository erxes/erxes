import { shallow } from 'enzyme';
import React from 'react';

import EmptyState from '../../../modules/common/components/EmptyState';

describe('EmptyState component', () => {
  const defaultProps = {
    text: 'null'
  };

  test('renders EmptyState successfully', () => {
    const wrapper = shallow(<EmptyState {...defaultProps} />);
    expect(wrapper).not.toBe('');
  });
});
