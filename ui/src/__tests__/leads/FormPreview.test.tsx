import { shallow } from 'enzyme';
import FormPreview from 'modules/leads/components/step/preview/FormPreview';
import React from 'react';

describe('FormPreview component', () => {
  const defaultProps = {
    formTitle: 'title',
    color: 'red',
    theme: 'default',
    onChange: (name: any, fields: string) => null,
    type: 'string',
    previewRenderer: () => <div />
  };

  test('renders shallow successfully', () => {
    const wrapper = shallow(<FormPreview {...defaultProps} />);
    expect(wrapper).not.toBe('');
  });
});
