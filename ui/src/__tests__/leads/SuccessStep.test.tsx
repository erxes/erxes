import { shallow } from 'enzyme';
import SuccessStep from 'modules/leads/components/step/SuccessStep';
import React from 'react';

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
    const wrapper = shallow(<SuccessStep {...defaultProps} />);
    expect(wrapper).not.toBe('');
  });
});
