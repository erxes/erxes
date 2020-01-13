import { shallow } from 'enzyme';
import React from 'react';

import PageContent from '../../modules/layout/components/PageContent';

describe('PageContent component', () => {
  const defaultProps = {
    transparent: false
  };
  test('renders PageContent successfully', () => {
    const wrapper = shallow(<PageContent {...defaultProps} />);
    expect(wrapper).not.toBe('');
  });
});
