import { shallow } from 'enzyme';
import CommonPreview from 'modules/leads/components/step/preview/CommonPreview';
import React from 'react';

describe('CommonPreview component', () => {
  const defaultProps = {
    title: 'string'
  };

  test('renders shallow successfully', () => {
    const wrapper = shallow(<CommonPreview {...defaultProps} />);
    expect(wrapper).not.toBe('');
  });
});
