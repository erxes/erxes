import { mount, shallow } from 'enzyme';
import * as React from 'react';
import * as renderer from 'react-test-renderer';

import Header from '../../modules/layout/components/Header';

describe('Header component', () => {
  const defaultProps = {
    title: 'default'
  };

  test('renders Header successfully', () => {
    shallow(<Header {...defaultProps} />);
  });

  test('renders successfully with default value', () => {
    const wrapper = mount(<Header {...defaultProps} />);
    const props = wrapper.props();

    expect(props).toMatchObject(defaultProps);
  });

  test('snapshot matches', () => {
    const rendered = renderer.create(<Header {...defaultProps} />).toJSON();

    expect(rendered).toMatchSnapshot();
  });
});
