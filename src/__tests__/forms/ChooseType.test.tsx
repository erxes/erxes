import { mount, shallow } from 'enzyme';
import ChooseType from 'modules/forms/components/step/ChooseType';
import React from 'react';

describe('ChooseType component', () => {
  const defaultProps = {
    type: 'string',
    onChange: (name: 'type', value: string) => null,
    color: 'pink',
    theme: 'default'
  };

  test('renders shallow successfully', () => {
    shallow(<ChooseType {...defaultProps} />);
  });

  test('renders mount with default props', () => {
    const control = mount(<ChooseType {...defaultProps} />);
    const props = control.props();

    expect(props).toMatchObject(defaultProps);
  });
});
