import { mount, shallow } from 'enzyme';
import * as React from 'react';

import DetectBrowser from '../../../../modules/layout/components/DetectBrowser';

describe('DetectBrowser component', () => {
  test('renders DetectBrowser successfully', () => {
    shallow(<DetectBrowser />);
  });

  test('renders successfully with default value', () => {
    const wrapper = mount(<DetectBrowser />);
    wrapper.props();
  });
});
