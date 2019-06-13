import { mount, shallow } from 'enzyme';
import * as React from 'react';
import * as renderer from 'react-test-renderer';

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

  test('snapshot matches', () => {
    const rendered = renderer.create(<Filter {...defaultProps} />).toJSON();

    expect(rendered).toMatchSnapshot();
  });
});
