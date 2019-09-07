import { mount, shallow } from 'enzyme';
import React from 'react';

import ProgressBar from '../../../modules/common/components/ProgressBar';

describe('ProgressBar component', () => {
  const defaultProps = {
    percentage: 50
  };

  test('renders shallow successfully', () => {
    shallow(<ProgressBar {...defaultProps} />);
  });
});
