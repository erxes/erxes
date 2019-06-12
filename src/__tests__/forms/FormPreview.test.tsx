import { mount, shallow } from 'enzyme';
import FormPreview from 'modules/forms/components/step/preview/FormPreview';
import * as React from 'react';
import * as renderer from 'react-test-renderer';

describe('FormPreview component', () => {
  const defaultProps = {
    formTitle: 'title',
    color: 'red',
    theme: 'default',
    onChange: (name: any, fields: string) => null,
    type: 'string'
  };

  test('renders shallow successfully', () => {
    shallow(<FormPreview {...defaultProps} />);
  });

  test('renders mount with default props', () => {
    const control = mount(<FormPreview {...defaultProps} />);
    const props = control.props();

    expect(props).toMatchObject(defaultProps);
  });
});
