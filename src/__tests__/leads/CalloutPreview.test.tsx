import { shallow } from 'enzyme';
import CalloutPreview from 'modules/leads/components/step/preview/CalloutPreview';
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
