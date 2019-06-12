import { mount, shallow } from 'enzyme';
import * as React from 'react';
import * as renderer from 'react-test-renderer';

import Steps from '../../../../modules/common/components/step/Steps';

describe('Group component', () => {
  const defaultProps = {
    children: [],
    active: 0
  };

  test('renders Steps successfully', () => {
    shallow(<Steps {...defaultProps} />);
  });

  test('renders successfully with default value', () => {
    const wrapper = mount(<Steps {...defaultProps} />);
    const props = wrapper.props();

    expect(props).toMatchObject(defaultProps);
  });

  test('snapshot matches', () => {
    const rendered = renderer.create(<Steps {...defaultProps} />).toJSON();

    expect(rendered).toMatchSnapshot();
  });
});
