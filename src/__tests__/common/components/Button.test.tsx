import { mount, shallow } from 'enzyme';
import * as React from 'react';
import * as renderer from 'react-test-renderer';

import Button from '../../../modules/common/components/Button';

describe('Button component', () => {
  const defaultProps = {
    btnStyle: 'default',
    size: 'medium',
    block: false,
    type: 'button'
  };

  test('renders successfully', () => {
    shallow(<Button />);
  });

  test('snapshot matches', () => {
    const rendered = renderer.create(<Button {...defaultProps} />).toJSON();

    expect(rendered).toMatchSnapshot();
  });

  test('fully renders with default props', () => {
    const rendered = mount(<Button {...defaultProps} />);
    const props = rendered.props();

    expect(defaultProps).toMatchObject(props);
  });

  test('fully renders with custom props', () => {
    const p = {
      ...defaultProps,
      size: 'large',
      type: 'submit',
      block: true
    };

    const rendered = mount(<Button {...p} />);
    const props = rendered.props();

    expect(p).toMatchObject(props);
  });
});
