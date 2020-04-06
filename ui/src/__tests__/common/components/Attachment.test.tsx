import { shallow } from 'enzyme';
import React from 'react';
import Attachment from '../../../modules/common/components/Attachment';

describe('Attachment component', () => {
  const defaultProps = {
    attachment: {
      name: 'string',
      type: 'text',
      url: 'string'
    },
    scrollBottom: () => null
  };

  test('renders successfully', () => {
    const wrapper = shallow(<Attachment {...defaultProps} />).debug();
    expect(wrapper).not.toBe('');
  });

  test('render null', () => {
    defaultProps.attachment.type = '';
    const wrapper = shallow(<Attachment {...defaultProps} />).debug();
    expect(wrapper).toBe('');
  });
});
