import { shallow } from 'enzyme';
import React from 'react';

import HeadlinesButton from '../../../../modules/common/components/editor/HeadlinesButton';

describe('HeadlinesButton component', () => {
  const defaultProps = {
    onOverrideContent: e => null
  };

  test('renders HeadlinesButton successfully', () => {
    const wrapper = shallow(<HeadlinesButton {...defaultProps} />);
    expect(wrapper).not.toBe('');
  });
});
