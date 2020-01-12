import { shallow } from 'enzyme';
import ChooseType from 'modules/leads/components/step/ChooseType';
import React from 'react';

describe('ChooseType component', () => {
  const defaultProps = {
    type: 'string',
    onChange: (name: 'type', value: string) => null,
    color: 'pink',
    theme: 'default'
  };

  test('renders shallow successfully', () => {
    const wrapper = shallow(<ChooseType {...defaultProps} />);
    expect(wrapper).not.toBe('');
  });
});
