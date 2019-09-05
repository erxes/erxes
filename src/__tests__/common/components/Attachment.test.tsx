import { mount, shallow } from 'enzyme';
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
    shallow(<Attachment {...defaultProps} />);
  });

  test('renders with default props', () => {
    const control = mount(<Attachment {...defaultProps} />);
    const props = control.props();

    expect(props).toMatchObject(defaultProps);
  });
});
