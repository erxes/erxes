import { shallow } from 'enzyme';
import React from 'react';
import Attachments from '../../../modules/common/components/Attachments';

describe('Attachment component', () => {
  const defaultProps = {
    attachments: [
      {
        name: 'string',
        type: 'text',
        url: 'string'
      }
    ],
    scrollBottom: () => null
  };

  test('renders successfully', () => {
    const wrapper = shallow(<Attachments {...defaultProps} />).debug();
    expect(wrapper).not.toBe('');
  });

  test('render null', () => {
    defaultProps.attachment.type = '';
    const wrapper = shallow(<Attachments {...defaultProps} />).debug();
    expect(wrapper).toBe('');
  });
});
