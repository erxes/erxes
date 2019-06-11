import { mount, shallow } from 'enzyme';
import * as React from 'react';

import Content from '../../modules/onboard/components/Content';

describe('Content component', () => {
  const defaultProps = {
    activeStep: 0
  };

  test('renders Content successfully', () => {
    shallow(<Content {...defaultProps} />);
  });

  test('renders successfully with default value', () => {
    const wrapper = mount(<Content {...defaultProps} />);
    const props = wrapper.props();

    expect(props).toMatchObject(defaultProps);
  });
});
