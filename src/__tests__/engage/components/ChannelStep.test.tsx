import { shallow } from 'enzyme';
import ChannelStep from 'modules/engage/components/step/ChannelStep';
import React from 'react';

describe('ChannelStep component', () => {
  const defaultProps = {
    onChange: (name: 'method', value: string) => null,
    method: 'method'
  };

  test('renders successfully', () => {
    const wrapper = shallow(<ChannelStep {...defaultProps} />);
    expect(wrapper).not.toBe('');
  });
});
