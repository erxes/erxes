import { shallow } from 'enzyme';
import FullPreviewStep from 'modules/leads/components/step/FullPreview';
import React from 'react';

describe('FullPreviewStep component', () => {
  const defaultProps = {
    type: 'string',
    color: 'red',
    theme: 'default',
    onChange: (name: 'carousel', value: string) => null,
    carousel: 'carousel',
    formData: {
      title: 'Title',
      btnText: 'Save',
      desc: 'desc'
    }
  };

  test('renders shallow successfully', () => {
    const wrapper = shallow(<FullPreviewStep {...defaultProps} />);
    expect(wrapper).not.toBe('');
  });
});
