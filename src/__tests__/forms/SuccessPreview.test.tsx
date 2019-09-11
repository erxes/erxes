import { shallow } from 'enzyme';
import SuccessPreview from 'modules/forms/components/step/preview/SuccessPreview';
import React from 'react';

describe('SuccessPreview component', () => {
  const defaultProps = {
    onChange: (name: any, value: string) => null,
    color: 'red',
    theme: 'def'
  };

  test('renders shallow successfully', () => {
    const wrapper = shallow(<SuccessPreview {...defaultProps} />);
    expect(wrapper).not.toBe('');
  });
});
