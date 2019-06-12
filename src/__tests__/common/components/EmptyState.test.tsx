import { mount, shallow } from 'enzyme';
import * as React from 'react';
import * as renderer from 'react-test-renderer';

import EmptyState from '../../../modules/common/components/EmptyState';

describe('EmptyState component', () => {
  const defaultProps = {
    text: 'null'
  };

  test('renders EmptyState successfully', () => {
    shallow(<EmptyState {...defaultProps} />);
  });

  test('snapshot matches', () => {
    const rendered = renderer.create(<EmptyState {...defaultProps} />).toJSON();

    expect(rendered).toMatchSnapshot();
  });

  test('renders successfully with default value', () => {
    const wrapper = mount(<EmptyState {...defaultProps} />);
    const props = wrapper.props();

    expect(props).toMatchObject(defaultProps);
  });
});
