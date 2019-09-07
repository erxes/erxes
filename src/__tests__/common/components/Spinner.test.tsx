import { mount, shallow } from 'enzyme';
import React from 'react';

import Spinner from '../../../modules/common/components/Spinner';

describe('Spinner component', () => {
  const defaultProps = {
    objective: true
  };

  test('renders Spinner successfully', () => {
    shallow(<Spinner {...defaultProps} />);
  });
});
