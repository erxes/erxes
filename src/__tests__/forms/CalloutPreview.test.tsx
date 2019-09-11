import { shallow } from 'enzyme';
import CalloutPreview from 'modules/forms/components/step/preview/CalloutPreview';
import React from 'react';

describe('CalloutPreview component', () => {
  const defaultProps = {
    calloutTitle: 'string'
  };

  test('renders shallow successfully', () => {
    const wrapper = shallow(<CalloutPreview {...defaultProps} />);
    expect(wrapper).not.toBe('');
  });
});
