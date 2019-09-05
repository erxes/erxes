import { mount, shallow } from 'enzyme';
import React from 'react';

import { IButtonMutateProps } from 'modules/common/types';
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
      callback: () => void;
    }) => null,
    afterSave: () => null,
    renderButton: (props: IButtonMutateProps) => <div />
  };

  test('renders Form successfully', () => {
    shallow(<Form {...defaultProps} />);
  });

  test('renders successfully with default value', () => {
    const wrapper = mount(<Form {...defaultProps} />);
    const props = wrapper.props();

    expect(props).toMatchObject(defaultProps);
  });

  // test('snapshot matches', () => {
  //   const rendered = renderer.create(<Form {...defaultProps} />).toJSON();

  //   expect(rendered).toMatchSnapshot();
  // });
});
