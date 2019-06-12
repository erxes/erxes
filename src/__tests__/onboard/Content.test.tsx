import { mount, shallow } from 'enzyme';
import * as React from 'react';
import * as renderer from 'react-test-renderer';

import Content from '../../modules/onboard/components/Content';

describe('Content component', () => {
  const defaultProps = {
    activeStep: 0
  };

  test('renders Content successfully', () => {
    shallow(<Content {...defaultProps} />);
  });

  test('renders successfully with default value', () => {
    const wrapper = mount(<Content {...defaultProps} />);
    const props = wrapper.props();

    expect(props).toMatchObject(defaultProps);
  });

  test('snapshot matches', () => {
    const rendered = renderer.create(<Content {...defaultProps} />).toJSON();

    expect(rendered).toMatchSnapshot();
  });
});
