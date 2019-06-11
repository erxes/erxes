import { mount, shallow } from 'enzyme';
import * as React from 'react';

import ActionBar from '../../modules/layout/components/ActionBar';

describe('ActionBar component', () => {
  const defaultProps = {
    background: 'black'
  };

  test('renders ActionBar successfully', () => {
    shallow(<ActionBar {...defaultProps} />);
  });

  test('renders successfully with default value', () => {
    const wrapper = mount(<ActionBar {...defaultProps} />);
    const props = wrapper.props();

    expect(props).toMatchObject(defaultProps);
  });
});
