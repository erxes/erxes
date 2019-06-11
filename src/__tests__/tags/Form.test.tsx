import { mount, shallow } from 'enzyme';
import * as React from 'react';

import Form from '../../modules/tags/components/Form';

describe('Form component', () => {
  const defaultProps = {
    type: 'typ',
    closeModal: () => null,
    save: (params: {
      doc: {
        _id?: string;
        name: string;
        type: string;
        colorCode: string;
      };
      callback: () => void;
    }) => null
  };

  test('renders Form successfully', () => {
    shallow(<Form {...defaultProps} />);
  });

  test('renders successfully with default value', () => {
    const wrapper = mount(<Form {...defaultProps} />);
    const props = wrapper.props();

    expect(props).toMatchObject(defaultProps);
  });
});
