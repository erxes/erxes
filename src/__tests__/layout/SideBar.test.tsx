import { mount, shallow } from 'enzyme';
import * as React from 'react';
import * as renderer from 'react-test-renderer';

import Sidebar from '../../modules/layout/components/Sidebar';

describe('Sidebar component', () => {
  const defaultProps = {
    children: 'child'
  };

  test('renders Sidebar successfully', () => {
    shallow(<Sidebar {...defaultProps} />);
  });

  test('renders successfully with default value', () => {
    const wrapper = mount(<Sidebar {...defaultProps} />);
    const props = wrapper.props();

    expect(props).toMatchObject(defaultProps);
  });

  test('snapshot matches', () => {
    const rendered = renderer.create(<Sidebar {...defaultProps} />).toJSON();

    expect(rendered).toMatchSnapshot();
  });
});
