import { shallow } from 'enzyme';
import FormFieldPreview from 'modules/forms/components/step/preview/FormFieldPreview';
import React from 'react';

describe('FormFieldPreview component', () => {
  const defaultProps = {
    onChange: (name: string, fields: any) => false
  };

  test('renders shallow successfully', () => {
    shallow(<FormFieldPreview {...defaultProps} />);
  });
});
