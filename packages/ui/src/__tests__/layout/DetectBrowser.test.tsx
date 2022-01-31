import { shallow } from 'enzyme';
import React from 'react';

import DetectBrowser from '../../modules/layout/components/DetectBrowser';

describe('DetectBrowser component', () => {
  test('renders DetectBrowser successfully', () => {
    const wrapper = shallow(<DetectBrowser />);
    expect(wrapper).not.toBe('');
  });
});
