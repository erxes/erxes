import { mount, shallow } from 'enzyme';
import SuccessStep from 'modules/forms/components/step/SuccessStep';
import * as React from 'react';
import * as renderer from 'react-test-renderer';

describe('SuccessStep component', () => {
  const defaultProps = {
    type: 'string',
    color: 'string',
    theme: 'string',
    onChange: (
      name:
        | 'successAction'
        | 'fromEmail'
        | 'userEmailTitle'
        | 'userEmailContent'
        | 'adminEmails'
        | 'adminEmailTitle'
        | 'adminEmailContent'
        | 'redirectUrl'
        | 'thankContent',
      value: string
    ) => null
  };

  test('renders shallow successfully', () => {
    shallow(<SuccessStep {...defaultProps} />);
  });

  test('renders mount with default props', () => {
    const control = mount(<SuccessStep {...defaultProps} />);
    const props = control.props();

    expect(props).toMatchObject(defaultProps);
  });
});
