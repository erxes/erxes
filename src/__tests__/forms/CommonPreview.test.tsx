import { mount, shallow } from 'enzyme';
import CommonPreview from 'modules/forms/components/step/preview/CommonPreview';
import React from 'react';

describe('CommonPreview component', () => {
  const defaultProps = {
    title: 'string'
  };

  test('renders shallow successfully', () => {
    shallow(<CommonPreview {...defaultProps} />);
  });

  test('renders mount with default props', () => {
    const control = mount(<CommonPreview {...defaultProps} />);
    const props = control.props();

    expect(props).toMatchObject(defaultProps);
  });
});
