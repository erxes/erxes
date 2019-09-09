import { mount, shallow } from 'enzyme';
import CalloutPreview from 'modules/forms/components/step/preview/CalloutPreview';
import React from 'react';

describe('CalloutPreview component', () => {
  const defaultProps = {
    calloutTitle: 'string'
  };

  test('renders shallow successfully', () => {
    shallow(<CalloutPreview {...defaultProps} />);
  });
});
