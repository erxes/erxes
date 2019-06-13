import { mount, shallow } from 'enzyme';
import * as React from 'react';
import * as renderer from 'react-test-renderer';

import FilterToggler from '../../../modules/inbox/components/leftSidebar/FilterToggler';

describe('FilterToggler component', () => {
  const defaultProps = {
    groupText: 'Channels',
    isOpen: false,

    toggle: (params: { isOpen: boolean }) => null
  };

  test('renders FilterToggler successfully', () => {
    shallow(<FilterToggler {...defaultProps} />);
  });

  test('snapshot matches', () => {
    const rendered = renderer
      .create(<FilterToggler {...defaultProps} />)
      .toJSON();

    expect(rendered).toMatchSnapshot();
  });

  test('renders with default props', () => {
    const wrapper = mount(<FilterToggler {...defaultProps} />);
    const props = wrapper.props();

    expect(props).toMatchObject(defaultProps);
  });
});
