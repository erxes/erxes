import { mount, shallow } from 'enzyme';
import * as React from 'react';
import * as renderer from 'react-test-renderer';

import Info from '../../../modules/common/components/Info';

describe('Info component', () => {
  const defaultProps = {
    children: 'child'
  };

  test('renders Info successfully', () => {
    shallow(<Info {...defaultProps} />);
  });

  test('renders Info successfully with default value', () => {
    const wrapper = mount(<Info {...defaultProps} />);
    const props = wrapper.props();

    expect(props).toMatchObject(defaultProps);
  });

  test('snapshot matches', () => {
    const rendered = renderer.create(<Info {...defaultProps} />).toJSON();

    expect(rendered).toMatchSnapshot();
  });
});
