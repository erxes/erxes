// test passed
import { mount, shallow } from 'enzyme';
import ChannelStep from 'modules/engage/components/step/ChannelStep';
import * as React from 'react';

describe('ChannelStep component', () => {
  const defaultProps = {
    onChange: (name: 'method', value: string) => null,
    method: 'method'
  };

  test('renders successfully', () => {
    shallow(<ChannelStep {...defaultProps} />);
  });

  test('renders with default props', () => {
    const control = mount(<ChannelStep {...defaultProps} />);
    const props = control.props();

    expect(props).toMatchObject(defaultProps);
  });
});
