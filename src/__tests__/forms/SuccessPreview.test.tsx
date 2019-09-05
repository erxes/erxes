import { mount, shallow } from 'enzyme';
import SuccessPreview from 'modules/forms/components/step/preview/SuccessPreview';
import React from 'react';

describe('SuccessPreview component', () => {
  const defaultProps = {
    onChange: (name: any, value: string) => null,
    color: 'red',
    theme: 'def'
  };

  test('renders shallow successfully', () => {
    shallow(<SuccessPreview {...defaultProps} />);
  });

  test('renders mount with default props', () => {
    const control = mount(<SuccessPreview {...defaultProps} />);
    const props = control.props();

    expect(props).toMatchObject(defaultProps);
  });
});
