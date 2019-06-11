import { mount, shallow } from 'enzyme';
import * as React from 'react';

import Spinner from '../../../../modules/common/components/Spinner';

describe('Spinner component', () => {
  const defaultProps = {
    objective: true
  };

  test('renders Spinner successfully', () => {
    shallow(<Spinner {...defaultProps} />);
  });

  test('renders successfully with default value', () => {
    const wrapper = mount(<Spinner {...defaultProps} />);
    const props = wrapper.props();

    expect(props).toMatchObject(defaultProps);
  });
});
