import { shallow } from 'enzyme';
import React from 'react';

import DetectBrowser from '../../modules/layout/components/DetectBrowser';

describe('DetectBrowser component', () => {
  test('renders DetectBrowser successfully', () => {
    shallow(<DetectBrowser />);
  });
});
