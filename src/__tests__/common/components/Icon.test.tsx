import { mount, shallow } from 'enzyme';
import * as React from 'react';
import Icon from '../../../modules/common/components/Icon';

describe('Icon component', () => {
  const defaultProps = {
    icon: 'upload-1',
    size: 30,
    isActive: false
  };

  test('renders successfully', () => {
    shallow(<Icon {...defaultProps} />);
  });

  test('renders with default props', () => {
    const control = mount(<Icon {...defaultProps} />);
    const props = control.props();

    expect(props).toMatchObject(defaultProps);
  });

  test('renders test email', () => {
    defaultProps.icon = 'email';

    const rendered = mount(<Icon {...defaultProps} />);
    const props = rendered.props();

    expect(defaultProps).toMatchObject(props);
  });

  test('renders test email on icon and size', () => {
    defaultProps.size = 10;

    const rendered = mount(<Icon {...defaultProps} />);
    const props = rendered.props();

    expect(defaultProps).toMatchObject(props);
  });

  test('render piggy icon', () => {
    defaultProps.icon = 'icon-piggy-bank';

    const rendered = mount(<Icon {...defaultProps} />);
    const piggy = rendered.find('i').debug();
    const piggyFound = piggy.search('icon="icon-piggy-bank"');

    expect(piggyFound).toBeGreaterThan(-1);
  });
});
