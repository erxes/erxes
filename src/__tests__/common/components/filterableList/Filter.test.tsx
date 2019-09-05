import { mount, shallow } from 'enzyme';
import React from 'react';

import Filter from '../../../../modules/common/components/filterableList/Filter';

describe('Filter component', () => {
  const defaultProps = {
    onChange: (e: React.FormEvent<HTMLElement>) => null
  };

  test('renders Filter successfully', () => {
    shallow(<Filter {...defaultProps} />);
  });

  test('renders successfully with default value', () => {
    const wrapper = mount(<Filter {...defaultProps} />);
    const props = wrapper.props();

    expect(props).toMatchObject(defaultProps);
  });
});
