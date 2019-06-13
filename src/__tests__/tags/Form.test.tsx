import { mount, shallow } from 'enzyme';
import * as React from 'react';
import * as renderer from 'react-test-renderer';

import Form from '../../modules/tags/components/Form';

describe('Form component', () => {
  const defaultProps = {
    type: 'typ',
    save: (params: {
      doc: {
        _id?: string;
        name: string;
        type: string;
        colorCode: string;
      };
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

  test('snapshot matches', () => {
    const rendered = renderer.create(<Form {...defaultProps} />).toJSON();

    expect(rendered).toMatchSnapshot();
  });
});
