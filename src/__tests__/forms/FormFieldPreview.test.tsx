import { mount, shallow } from 'enzyme';
import FormFieldPreview from 'modules/forms/components/step/preview/FormFieldPreview';
import * as React from 'react';
import * as renderer from 'react-test-renderer';

describe('FormFieldPreview component', () => {
  const defaultProps = {
    onChange: (name: string, fields: any) => false
  };

  test('renders shallow successfully', () => {
    shallow(<FormFieldPreview {...defaultProps} />);
  });

  test('renders mount with default props', () => {
    const control = mount(<FormFieldPreview {...defaultProps} />);
    const props = control.props();

    expect(props).toMatchObject(defaultProps);
  });
});
