import { mount, shallow } from 'enzyme';
import * as React from 'react';
import * as renderer from 'react-test-renderer';

import Step from '../../../../modules/common/components/step/Step';

describe('Step component', () => {
  const defaultProps = {
    children: false
  };

  test('renders Step successfully', () => {
    shallow(<Step {...defaultProps} />);
  });

  test('renders successfully with default value', () => {
    const wrapper = mount(<Step {...defaultProps} />);
    const props = wrapper.props();

    expect(props).toMatchObject(defaultProps);
  });

  test('snapshot matches', () => {
    const rendered = renderer.create(<Step {...defaultProps} />).toJSON();

    expect(rendered).toMatchSnapshot();
  });
});
